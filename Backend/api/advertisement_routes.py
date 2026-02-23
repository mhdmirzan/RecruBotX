"""
Advertisement Routes — Hybrid AI Generation (Portrait)
========================================================
Flow:
  1. Receive structured JSON from frontend
  2. LangChain (Gemini) refines text AND builds a BACKGROUND-ONLY image prompt
     (no text in the AI image — text accuracy is handled by Pillow)
  3. Hugging Face / Gemini generates a beautiful TEXT-FREE background scene
  4. Pillow overlays the exact refined text with pixel-perfect rendering
  5. Return base64 image, save to MongoDB

LinkedIn Portrait: 1080 × 1350 px
"""

import os
import io
import json
import base64
import textwrap
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId

from database.connection import get_database

# ── LangChain ──────────────────────────────────────────────────────────────
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# ── LangSmith tracing (opt-in via env vars) ────────────────────────────────
try:
    from langsmith import traceable
    LANGSMITH_AVAILABLE = True
except ImportError:
    def traceable(func=None, **kwargs):
        if func is None:
            return lambda f: f
        return func
    LANGSMITH_AVAILABLE = False

# ── Hugging Face ───────────────────────────────────────────────────────────
try:
    from huggingface_hub import InferenceClient
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False

# ── Pillow (for text overlay) ──────────────────────────────────────────────
try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

# ── Google genai SDK (Gemini Imagen fallback) ──────────────────────────────
try:
    from google import genai as google_genai
    from google.genai import types as google_types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

router = APIRouter(prefix="/advertisements", tags=["advertisements"])

# ── Portrait dimensions ───────────────────────────────────────────────────
W, H = 1080, 1350
AD_SIZE = (W, H)


# ══════════════════════════════════════════════════════════════════════════
# REQUEST MODEL
# ══════════════════════════════════════════════════════════════════════════

class AdvertisementRequest(BaseModel):
    recruiterId: str
    jobTitle: str
    companyName: str
    companyDescription: str = ""
    location: str = ""
    employmentType: str = ""
    workMode: str = ""
    urgentHiring: bool = False
    responsibilities: list = []
    requirements: list = []
    salaryRange: str = ""
    salaryConfidential: bool = False
    benefits: list = []
    certifications: list = []
    deadline: str = ""
    contactEmail: str = ""
    applicationLink: str = ""
    phone: str = ""
    primaryColor: str = "#0a2a5e"
    secondaryColor: str = "#2b4c8c"
    adSize: str = "linkedin_post"


# ══════════════════════════════════════════════════════════════════════════
# STAGE 1 — LangChain: Refine text + build BACKGROUND-ONLY image prompt
# ══════════════════════════════════════════════════════════════════════════

REFINE_SYSTEM = """You are an expert job advertisement creative director.

Given a structured job advertisement JSON, you will:
1. Refine the text — keep it professional and polished while staying FAITHFUL to the
   original input. Do NOT invent or add information that wasn't provided.
   - Preserve the exact job title, company name, location, and employment type as given.
   - For responsibilities and requirements: tighten wording (max 10 words each) but keep
     the original meaning. Do NOT substitute or change the actual content.
   - Keep all contact info (email, phone, deadline) exactly as provided.
2. Build a text-to-image prompt for a BACKGROUND-ONLY image. The prompt must NOT
   ask the model to render any text, letters, words, or typography. It should only
   describe the visual scene suitable as a backdrop for a portrait job ad poster.

The background prompt should describe:
- A professional workplace or industry scene matching the job
- Portrait orientation, 1080x1350 pixels
- The TOP ~40% should be a bright, vivid workplace scene
- The BOTTOM ~60% should have darker tones (dark navy/blue gradient) for text overlay
- High-quality, 4K, photorealistic or stylized professional look
- NO text, NO letters, NO words, NO logos, NO watermarks in the image
- Clean, modern corporate aesthetic

Return JSON with exactly these keys:
{{
  "refined_title": "<<exact job title from input, only fix capitalization>>",
  "refined_company": "<<exact company name from input>>",
  "refined_location": "<<exact location from input>>",
  "refined_type": "<<exact employment type from input>>",
  "refined_work_mode": "<<exact work mode from input>>",
  "top_responsibilities": ["<<tightened but faithful to original, max 10 words>>", "max 4 items"],
  "top_requirements": ["<<tightened but faithful to original, max 10 words>>", "max 4 items"],
  "top_benefits": ["<<tightened but faithful to original, max 8 words>>", "max 3 items"],
  "apply_email": "<<exact email from input or empty string>>",
  "apply_deadline": "<<exact deadline from input or empty string>>",
  "apply_link": "<<exact application link from input or empty string>>",
  "apply_phone": "<<exact phone from input or empty string>>",
  "urgent": true,
  "salary_display": "<<exact salary from input, or Competitive if confidential>>",
  "background_prompt": "<<a detailed prompt for a TEXT-FREE portrait background image>>"
}}"""

REFINE_HUMAN = """Job Advertisement JSON:
{ad_json}

Produce the refined output now. Remember: stay faithful to the original text."""


@traceable(name="ad-text-refiner", run_type="chain")
def refine_and_build_prompt(input_data: dict) -> dict:
    """
    Stage 1: LangChain chain — refine job ad text and produce a
    text-free background image prompt.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _fallback_refined(input_data)

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.2,
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", REFINE_SYSTEM),
            ("human",  REFINE_HUMAN),
        ])

        parser = JsonOutputParser()
        chain  = prompt | llm | parser

        result = chain.invoke({"ad_json": json.dumps(input_data, indent=2)})
        print("✅ Text refined + background prompt built via LangChain")
        return result

    except Exception as e:
        print(f"⚠ LangChain refiner failed ({e}) — using fallback")
        return _fallback_refined(input_data)


def _fallback_refined(data: dict) -> dict:
    """Pure-Python fallback when Gemini is unavailable. Preserves original text."""
    resp  = [r for r in data.get("responsibilities", [])[:4] if r.strip()]
    reqs  = [r for r in data.get("requirements",     [])[:4] if r.strip()]
    bens  = [b for b in data.get("benefits",         [])[:3] if b.strip()]

    title    = data.get("jobTitle", "Open Position")
    company  = data.get("companyName", "Company")
    location = data.get("location", "")
    emp_type = data.get("employmentType", "")
    work_mode = data.get("workMode", "")
    salary   = data.get("salaryRange", "Competitive")
    if data.get("salaryConfidential"):
        salary = "Competitive"

    bg_prompt = (
        "Professional corporate workplace background, portrait 1080x1350, "
        "modern office interior with glass walls and natural light at the top, "
        "bottom half transitions to dark navy blue gradient for text placement, "
        "clean minimal corporate aesthetic, soft depth of field, "
        "warm professional lighting, 4K ultra high quality, photorealistic, "
        "absolutely NO text NO letters NO words NO logos NO watermarks, "
        "pure visual background only"
    )

    return {
        "refined_title":       title,
        "refined_company":     company,
        "refined_location":    location,
        "refined_type":        emp_type,
        "refined_work_mode":   work_mode,
        "top_responsibilities": resp,
        "top_requirements":    reqs,
        "top_benefits":        bens,
        "apply_email":         data.get("contactEmail", ""),
        "apply_deadline":      data.get("deadline", ""),
        "apply_link":          data.get("applicationLink", ""),
        "apply_phone":         data.get("phone", ""),
        "urgent":              data.get("urgentHiring", False),
        "salary_display":      salary,
        "background_prompt":   bg_prompt,
    }


# ══════════════════════════════════════════════════════════════════════════
# STAGE 2 — Generate TEXT-FREE background via HF / Gemini
# ══════════════════════════════════════════════════════════════════════════

def _bytes_to_pil(raw: bytes) -> Image.Image:
    """Convert raw bytes to a PIL Image resized to ad dimensions."""
    img = Image.open(io.BytesIO(raw)).convert("RGBA")
    return img.resize(AD_SIZE, Image.LANCZOS)


@traceable(name="hf-background-generation", run_type="tool")
def generate_background_hf(bg_prompt: str) -> Image.Image | None:
    """Generate a text-free background using HF Inference API."""
    hf_token = os.getenv("HF_API_TOKEN", "").strip()
    if not hf_token or not HF_AVAILABLE:
        print("⚠ HF_API_TOKEN not set — skipping HF generation")
        return None

    models = [
        "black-forest-labs/FLUX.1-schnell",
        "stabilityai/stable-diffusion-xl-base-1.0",
    ]

    client = InferenceClient(token=hf_token)

    for model in models:
        try:
            print(f"🎨 Generating background with {model}...")
            pil_img = client.text_to_image(
                prompt=bg_prompt,
                model=model,
                width=1088,    # nearest multiple of 64 to 1080
                height=1344,   # nearest multiple of 64 to 1350
            )
            pil_img = pil_img.convert("RGBA").resize(AD_SIZE, Image.LANCZOS)
            print(f"✅ HF background generated ({model})")
            return pil_img
        except Exception as e:
            print(f"⚠ {model} failed: {e}")
            continue

    return None


def generate_background_gemini(bg_prompt: str) -> Image.Image | None:
    """Fallback: Gemini Imagen for background generation."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or not GENAI_AVAILABLE:
        return None

    imagen_models = [
        "imagen-3.0-generate-002",
        "imagen-3.0-fast-generate-001",
        "imagegeneration@006",
    ]

    client = google_genai.Client(api_key=api_key)

    for model_name in imagen_models:
        try:
            print(f"🎨 Trying Gemini Imagen: {model_name}")
            response = client.models.generate_images(
                model=model_name,
                prompt=bg_prompt,
                config=google_types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="3:4",
                    safety_filter_level="BLOCK_ONLY_HIGH",
                ),
            )
            if response.generated_images:
                raw = response.generated_images[0].image.image_bytes
                return _bytes_to_pil(raw)
        except Exception as e:
            print(f"⚠ Gemini Imagen {model_name} failed: {e}")
            continue

    return None


def generate_background_gemini_native(bg_prompt: str) -> Image.Image | None:
    """Last fallback: Gemini 2.0 Flash inline image generation."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or not GENAI_AVAILABLE:
        return None

    image_gen_models = [
        "gemini-2.0-flash-exp-image-generation",
        "gemini-2.0-flash-exp",
    ]

    client = google_genai.Client(api_key=api_key)

    for model_name in image_gen_models:
        try:
            print(f"🎨 Trying Gemini native: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=bg_prompt,
                config=google_types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                    safety_settings=[
                        google_types.SafetySetting(
                            category="HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold="BLOCK_ONLY_HIGH",
                        )
                    ],
                ),
            )
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    return _bytes_to_pil(part.inline_data.data)
        except Exception as e:
            print(f"⚠ {model_name} failed: {e}")
            continue

    return None


def create_gradient_background(primary: str = "#0a2a5e", secondary: str = "#2b4c8c") -> Image.Image:
    """Ultimate fallback: generate a gradient background with Pillow."""
    def hex_to_rgb(h):
        h = h.lstrip("#")
        return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

    c1 = hex_to_rgb(primary)
    c2 = hex_to_rgb(secondary)

    img = Image.new("RGBA", AD_SIZE)
    # Top-to-bottom gradient for portrait
    for y_pos in range(H):
        r = int(c1[0] + (c2[0] - c1[0]) * y_pos / H)
        g = int(c1[1] + (c2[1] - c1[1]) * y_pos / H)
        b = int(c1[2] + (c2[2] - c1[2]) * y_pos / H)
        for x_pos in range(W):
            img.putpixel((x_pos, y_pos), (r, g, b, 255))

    return img


def get_background_image(bg_prompt: str, primary: str, secondary: str) -> Image.Image:
    """Get background: HF → Gemini Imagen → Gemini Native → Gradient."""
    bg = generate_background_hf(bg_prompt)
    if bg is None:
        bg = generate_background_gemini(bg_prompt)
    if bg is None:
        bg = generate_background_gemini_native(bg_prompt)
    if bg is None:
        print("⚠ All AI sources failed — using gradient background")
        bg = create_gradient_background(primary, secondary)
    return bg


# ══════════════════════════════════════════════════════════════════════════
# STAGE 3 — Pillow: Pixel-perfect text overlay on AI background (Portrait)
# ══════════════════════════════════════════════════════════════════════════

def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Load a clean sans-serif font. Falls back gracefully."""
    if bold:
        font_candidates = [
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/calibrib.ttf",
            "C:/Windows/Fonts/segoeui.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ]
    else:
        font_candidates = [
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/calibri.ttf",
            "C:/Windows/Fonts/segoeui.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ]
    for path in font_candidates:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def compose_text_overlay(bg: Image.Image, refined: dict, input_data: dict, primary_color: str = "#0a2a5e") -> str:
    """
    Overlay text onto AI background — professional recruitment ad design.
    Inspired by modern LinkedIn job posters with bold typography.
    Returns a base64 data-URL string.
    """
    img = bg.copy().convert("RGBA")

    # ── Helper: hex to RGBA tuple ────────────────────────────────────────
    DEFAULT_PRIMARY_RGB = (10, 42, 94)  # matches "#0a2a5e"

    def hex_rgba(h, a=255):
        """
        Convert hex color string to an (R, G, B, A) tuple.
        Falls back to DEFAULT_PRIMARY_RGB on malformed input.
        """
        if not isinstance(h, str):
            r, g, b = DEFAULT_PRIMARY_RGB
            return (r, g, b, a)
        h = h.lstrip("#")
        # Require at least 6 hex chars; ignore any extras.
        if len(h) < 6:
            r, g, b = DEFAULT_PRIMARY_RGB
            return (r, g, b, a)
        h = h[:6]
        try:
            r = int(h[0:2], 16)
            g = int(h[2:4], 16)
            b = int(h[4:6], 16)
            return (r, g, b, a)
        except ValueError:
            r, g, b = DEFAULT_PRIMARY_RGB
            return (r, g, b, a)

    pc = hex_rgba(primary_color)  # user-selected primary colour

    # ══════════════════════════════════════════════════════════════════════
    # OVERLAY LAYERS  (uses fast rectangle fills, not pixel loops)
    # ══════════════════════════════════════════════════════════════════════
    overlay = Image.new("RGBA", AD_SIZE, (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)

    # ▸ Top banner — semi-transparent dark strip for company name
    ov_draw.rectangle([(0, 0), (W, 100)], fill=(pc[0], pc[1], pc[2], 200))

    # ▸ Gradient fade from ~38% → ~48% (transparent → dark)
    fade_top = int(H * 0.38)
    fade_bot = int(H * 0.48)
    steps = fade_bot - fade_top
    for i in range(steps):
        a = int(220 * i / steps)
        ov_draw.rectangle(
            [(0, fade_top + i), (W, fade_top + i + 1)],
            fill=(pc[0] // 3, pc[1] // 3, pc[2] // 3, a),
        )

    # ▸ Solid dark panel from fade end → bottom
    ov_draw.rectangle(
        [(0, fade_bot), (W, H)],
        fill=(pc[0] // 3, pc[1] // 3, pc[2] // 3, 220),
    )

    # ▸ "Urgent Hiring" red badge (top-right) if urgent
    is_urgent = input_data.get("urgentHiring") or refined.get("urgent")

    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # ══════════════════════════════════════════════════════════════════════
    # FONTS
    # ══════════════════════════════════════════════════════════════════════
    f_company     = _load_font(32, bold=True)
    f_website     = _load_font(18, bold=False)
    f_hero_small  = _load_font(52, bold=False)   # "We're"
    f_hero_big    = _load_font(90, bold=True)     # "Hiring!"
    f_title       = _load_font(46, bold=True)     # Job title
    f_loc         = _load_font(22, bold=False)    # Location / type
    f_section     = _load_font(26, bold=True)     # Section headings
    f_bullet      = _load_font(21, bold=False)    # Bullet text
    f_apply_title = _load_font(30, bold=True)     # "Apply now"
    f_apply_body  = _load_font(19, bold=True)     # Contact details
    f_badge       = _load_font(22, bold=True)     # Urgent badge
    f_salary      = _load_font(22, bold=True)

    # ══════════════════════════════════════════════════════════════════════
    # COLOUR PALETTE
    # ══════════════════════════════════════════════════════════════════════
    white  = (255, 255, 255)
    light  = (210, 215, 230)
    gold   = (255, 195, 0)        # vibrant gold/amber
    dark   = (20, 30, 55)

    # ══════════════════════════════════════════════════════════════════════
    # TOP BANNER — Company name + website
    # ══════════════════════════════════════════════════════════════════════
    left = 55
    company = input_data.get("companyName", "") or refined.get("refined_company", "")
    if company:
        draw.text((left, 22), company, fill=white, font=f_company)
        # Company description or website-style subtext
        desc = input_data.get("companyDescription", "")
        if desc:
            short_desc = desc[:60] + ("..." if len(desc) > 60 else "")
            draw.text((left, 60), short_desc, fill=(200, 210, 230), font=f_website)

    # ── Urgent badge (top-right red rounded rectangle) ───────────────────
    if is_urgent:
        badge_w, badge_h = 200, 65
        bx = W - badge_w - 30
        by = 18
        ov2 = Image.new("RGBA", AD_SIZE, (0, 0, 0, 0))
        d2 = ImageDraw.Draw(ov2)
        d2.rounded_rectangle(
            [(bx, by), (bx + badge_w, by + badge_h)],
            radius=12,
            fill=(220, 30, 30, 240),
        )
        img = Image.alpha_composite(img, ov2)
        draw = ImageDraw.Draw(img)
        draw.text((bx + 22, by + 8), "URGENT", fill=white, font=f_badge)
        draw.text((bx + 28, by + 34), "HIRING", fill=white, font=f_badge)

    # ══════════════════════════════════════════════════════════════════════
    # HERO TEXT — "We're  Hiring!"
    # ══════════════════════════════════════════════════════════════════════
    hero_y = int(H * 0.33)
    draw.text((left, hero_y), "We're", fill=gold, font=f_hero_small)
    draw.text((left, hero_y + 55), "Hiring!", fill=gold, font=f_hero_big)

    # ══════════════════════════════════════════════════════════════════════
    # JOB TITLE (large, bold, white — exact from input)
    # ══════════════════════════════════════════════════════════════════════
    y = hero_y + 170
    title = input_data.get("jobTitle", "") or refined.get("refined_title", "Open Position")
    title_lines = textwrap.wrap(title, width=24)
    for line in title_lines[:3]:
        draw.text((left, y), line, fill=white, font=f_title)
        y += 54
    y += 8

    # ── Location | Type | Work Mode ──────────────────────────────────────
    location  = input_data.get("location", "") or refined.get("refined_location", "")
    emp_type  = input_data.get("employmentType", "") or refined.get("refined_type", "")
    work_mode = input_data.get("workMode", "") or refined.get("refined_work_mode", "")
    info_parts = [p for p in [location, emp_type, work_mode] if p]
    if info_parts:
        draw.text((left, y), "  |  ".join(info_parts), fill=light, font=f_loc)
        y += 32

    # ── Salary ───────────────────────────────────────────────────────────
    salary = input_data.get("salaryRange", "") or refined.get("salary_display", "")
    if input_data.get("salaryConfidential"):
        salary = ""
    if salary and salary not in ("Competitive", "Confidential", ""):
        draw.text((left, y), f"Salary: {salary}", fill=gold, font=f_salary)
        y += 34

    y += 20

    # ══════════════════════════════════════════════════════════════════════
    # TWO-COLUMN LAYOUT — Responsibilities (left) | Requirements (right)
    # ══════════════════════════════════════════════════════════════════════
    col_left_x  = left
    col_right_x = W // 2 + 20
    col_width   = W // 2 - left - 30   # available text width per column
    col_y_start = y

    # ── LEFT COLUMN:  "What You'll Do:" ──────────────────────────────────
    resps = input_data.get("responsibilities", [])
    resps = [r for r in resps if r and r.strip()]
    if not resps:
        resps = refined.get("top_responsibilities", [])

    left_y = col_y_start
    if resps:
        draw.text((col_left_x, left_y), "What You'll Do:", fill=gold, font=f_section)
        left_y += 40
        for r in resps[:5]:
            # Gold arrow + text
            draw.text((col_left_x, left_y), "\u25B6", fill=gold, font=f_bullet)
            lines = textwrap.wrap(r, width=22)
            for ln in lines[:2]:
                draw.text((col_left_x + 28, left_y), ln, fill=white, font=f_bullet)
                left_y += 28
            left_y += 6

    # ── RIGHT COLUMN: "You Should Have:" ─────────────────────────────────
    reqs = input_data.get("requirements", [])
    reqs = [r for r in reqs if r and r.strip()]
    if not reqs:
        reqs = refined.get("top_requirements", [])

    right_y = col_y_start
    if reqs:
        draw.text((col_right_x, right_y), "You Should Have:", fill=gold, font=f_section)
        right_y += 40
        for r in reqs[:5]:
            draw.text((col_right_x, right_y), "\u25B6", fill=gold, font=f_bullet)
            lines = textwrap.wrap(r, width=22)
            for ln in lines[:2]:
                draw.text((col_right_x + 28, right_y), ln, fill=white, font=f_bullet)
                right_y += 28
            right_y += 6

    y = max(left_y, right_y) + 10

    # ── Benefits (full-width, below columns) ─────────────────────────────
    bens = input_data.get("benefits", [])
    bens = [b for b in bens if b and b.strip()]
    if not bens:
        bens_list = refined.get("top_benefits", [])
        if isinstance(bens_list, list):
            bens = bens_list
    if bens and y < H - 200:
        draw.text((left, y), "Benefits:", fill=gold, font=f_section)
        y += 38
        for b in bens[:3]:
            draw.text((left, y), "\u25B6", fill=gold, font=f_bullet)
            lines = textwrap.wrap(b, width=48)
            for ln in lines[:2]:
                draw.text((left + 28, y), ln, fill=light, font=f_bullet)
                y += 28
            y += 4

    # ══════════════════════════════════════════════════════════════════════
    # APPLY NOW BOX — bordered rectangle at the bottom
    # ══════════════════════════════════════════════════════════════════════
    box_h = 130
    box_y = H - box_h - 30
    box_x1, box_y1 = left - 5, box_y
    box_x2, box_y2 = W - left + 5, box_y + box_h

    # Semi-transparent fill + gold border
    apply_overlay = Image.new("RGBA", AD_SIZE, (0, 0, 0, 0))
    ad = ImageDraw.Draw(apply_overlay)
    ad.rounded_rectangle(
        [(box_x1, box_y1), (box_x2, box_y2)],
        radius=14,
        fill=(pc[0] // 2, pc[1] // 2, pc[2] // 2, 180),
        outline=gold,
        width=3,
    )
    img = Image.alpha_composite(img, apply_overlay)
    draw = ImageDraw.Draw(img)

    # "Apply now" title
    draw.text((left + 20, box_y + 14), "Apply now", fill=gold, font=f_apply_title)

    # Contact details inside the box
    contact_y = box_y + 52
    email    = input_data.get("contactEmail", "") or refined.get("apply_email", "")
    deadline = input_data.get("deadline", "") or refined.get("apply_deadline", "")
    phone    = input_data.get("phone", "") or refined.get("apply_phone", "")
    app_link = input_data.get("applicationLink", "") or refined.get("apply_link", "")

    if email:
        draw.text((left + 20, contact_y), f"Email: {email}", fill=white, font=f_apply_body)
        contact_y += 28
    if phone:
        draw.text((left + 20, contact_y), f"Call: {phone}", fill=white, font=f_apply_body)
        contact_y += 28
    if deadline:
        draw.text((left + 20, contact_y), f"Deadline: {deadline}", fill=light, font=f_apply_body)
        contact_y += 28
    if app_link and contact_y < box_y2 - 10:
        draw.text((left + 20, contact_y), f"Link: {app_link}", fill=light, font=f_apply_body)

    # ══════════════════════════════════════════════════════════════════════
    # FINAL — convert to RGB, return base64
    # ══════════════════════════════════════════════════════════════════════
    img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return f"data:image/png;base64,{b64}"


# ══════════════════════════════════════════════════════════════════════════
# ENDPOINT
# ══════════════════════════════════════════════════════════════════════════

@router.post("/generate")
async def generate_advertisement(request: AdvertisementRequest, db=Depends(get_database)):
    """
    Generate a LinkedIn job advertisement (1080×1350, portrait).

    Pipeline:
      1. LangChain (Gemini) — refines text + builds background-only prompt
      2. HF / Gemini        — generates text-free background image
      3. Pillow             — overlays exact text (pixel-perfect)
      4. MongoDB            — saves document
    """
    input_data = {
        "jobTitle":           request.jobTitle,
        "companyName":        request.companyName,
        "companyDescription": request.companyDescription,
        "location":           request.location,
        "employmentType":     request.employmentType,
        "workMode":           request.workMode,
        "urgentHiring":       request.urgentHiring,
        "responsibilities":   request.responsibilities,
        "requirements":       request.requirements,
        "salaryRange":        request.salaryRange if not request.salaryConfidential else "Confidential",
        "salaryConfidential": request.salaryConfidential,
        "benefits":           request.benefits,
        "certifications":     request.certifications,
        "deadline":           request.deadline,
        "contactEmail":       request.contactEmail,
        "applicationLink":    request.applicationLink,
        "phone":              request.phone,
        "primaryColor":       request.primaryColor,
        "secondaryColor":     request.secondaryColor,
        "adSize":             "linkedin_post",
    }

    # ── Stage 1: Refine text + build background prompt ─────────────────
    try:
        refined = refine_and_build_prompt(input_data)
    except Exception as e:
        print(f"⚠ Refiner error: {e}")
        refined = _fallback_refined(input_data)

    bg_prompt = refined.get("background_prompt", "")
    if not bg_prompt:
        refined = _fallback_refined(input_data)
        bg_prompt = refined["background_prompt"]

    print(f"📝 Background prompt ({len(bg_prompt)} chars): {bg_prompt[:120]}...")

    # ── Stage 2: Generate text-free background ─────────────────────────
    try:
        bg_image = get_background_image(
            bg_prompt,
            request.primaryColor,
            request.secondaryColor,
        )
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Background generation error: {e}")

    # ── Stage 3: Overlay exact text with Pillow ────────────────────────
    try:
        image_base64 = compose_text_overlay(bg_image, refined, input_data, request.primaryColor)
        print(f"✅ Final ad composed — {len(image_base64)//1024}KB")
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Text overlay error: {e}")

    # ── Stage 4: Save to MongoDB ───────────────────────────────────────
    ad_document = {
        "recruiterId":      request.recruiterId,
        "refined":          refined,
        "inputData":        input_data,
        "imageBase64":      image_base64,
        "backgroundPrompt": bg_prompt,
        "adSize":           "linkedin_post",
        "canvasWidth":      W,
        "canvasHeight":     H,
        "createdAt":        datetime.utcnow().isoformat(),
    }
    result = await db["advertisements"].insert_one(ad_document)
    ad_id = str(result.inserted_id)

    return {
        "success":         True,
        "advertisementId": ad_id,
        "refined":         refined,
        "imageBase64":     image_base64,
        "adSize":          "linkedin_post",
        "canvasWidth":     W,
        "canvasHeight":    H,
    }


# ── History endpoints ───────────────────────────────────────────────────────

@router.get("/recruiter/{recruiter_id}")
async def get_recruiter_advertisements(recruiter_id: str, db=Depends(get_database)):
    """Get all advertisements for a recruiter (WITH images for history display)."""
    cursor = db["advertisements"].find(
        {"recruiterId": recruiter_id}
    ).sort("createdAt", -1)
    ads = []
    async for ad in cursor:
        ad["_id"] = str(ad["_id"])
        ads.append(ad)
    return {"advertisements": ads}


@router.get("/{ad_id}")
async def get_advertisement(ad_id: str, db=Depends(get_database)):
    """Get a single advertisement by ID (includes image)."""
    try:
        oid = ObjectId(ad_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid advertisement ID")
    ad = await db["advertisements"].find_one({"_id": oid})
    if not ad:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    ad["_id"] = str(ad["_id"])
    return ad


@router.delete("/{ad_id}")
async def delete_advertisement(ad_id: str, db=Depends(get_database)):
    """Delete an advertisement."""
    try:
        oid = ObjectId(ad_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid advertisement ID")
    result = await db["advertisements"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    return {"success": True, "message": "Advertisement deleted"}
