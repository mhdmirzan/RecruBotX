import os
import io
import shutil
import asyncio
import json
import threading
import tempfile
from datetime import datetime

import flet as ft
from dotenv import load_dotenv

from voice_agent import VoiceAgent

load_dotenv()

# Theme colors
PRIMARY = "#1E88E5"  # blue
BG = "#F5F7FB"
CARD = "#FFFFFF"
TEXT = "#0D1B2A"


def main(page: ft.Page):
    page.title = "AI Interviewer"
    page.theme_mode = "light"
    page.padding = 16
    page.bgcolor = BG
    page.theme = ft.Theme(color_scheme_seed=PRIMARY)
    page.update()

    # Shared state
    agent_ref = {"agent": None}
    running = {"flag": False}
    current_report = {"path": None}

    def save_file_result(e: ft.FilePickerResultEvent):
        if e.path and current_report["path"]:
            try:
                shutil.copy(current_report["path"], e.path)
                set_status(f"Saved to {e.path}")
            except Exception as ex:
                set_status(f"Error saving: {ex}")

    file_picker = ft.FilePicker(on_result=save_file_result)
    page.overlay.append(file_picker)

    # Controls
    field_dd = ft.Dropdown(
        label="Interview Field",
        options=[ft.dropdown.Option(f) for f in VoiceAgent.FIELDS],
        value=VoiceAgent.FIELDS[0],
        width=320,
    )

    level_dd = ft.Dropdown(
        label="Position Level",
        options=[ft.dropdown.Option(lv) for lv in VoiceAgent.LEVELS],
        value=VoiceAgent.LEVELS[0],
        width=200,
    )

    num_q = ft.TextField(label="Number of questions (1-10)", value="3", width=200)

    status_text = ft.Text(value="Idle", color=TEXT, size=14)
    question_text = ft.Text(value="Question will appear here", color=TEXT, size=16, weight=ft.FontWeight.W_600)
    answer_text = ft.Text(value="Your answer transcription will appear here", color=TEXT, size=14)

    feedback_column = ft.Column(scroll=ft.ScrollMode.AUTO, spacing=8)
    download_btn = ft.ElevatedButton("Download Feedback", icon=ft.Icons.DOWNLOAD, disabled=True)

    # Layout
    controls_row = ft.Row([
        field_dd,
        level_dd,
        num_q,
        ft.ElevatedButton(
            "Start Interview",
            bgcolor=PRIMARY,
            color="white",
            icon=ft.Icons.PLAY_ARROW,
            on_click=lambda e: start_interview(),
        ),
    ], spacing=12)

    body = ft.Column([
        controls_row,
        ft.Container(height=8),
        ft.Container(
            content=ft.Column([
                ft.Text("Live Question", size=18, weight=ft.FontWeight.W_700, color=PRIMARY),
                question_text,
                ft.Divider(),
                ft.Text("Live Transcription", size=18, weight=ft.FontWeight.W_700, color=PRIMARY),
                answer_text,
            ], spacing=8),
            padding=16,
            bgcolor=CARD,
            border_radius=12,
            shadow=ft.BoxShadow(blur_radius=12, color="#90A4AE33"),
        ),
        ft.Container(height=12),
        ft.Text("Feedback", size=18, weight=ft.FontWeight.W_700, color=PRIMARY),
        ft.Container(content=feedback_column, padding=12, bgcolor=CARD, border_radius=12, shadow=ft.BoxShadow(blur_radius=12, color="#90A4AE33")),
        ft.Container(height=8),
        download_btn,
        ft.Container(height=12),
        status_text,
    ], expand=True, spacing=12)

    page.add(body)

    def set_status(msg: str):
        status_text.value = msg
        page.update()

    def set_question(text: str):
        question_text.value = text
        page.update()

    def set_answer(text: str):
        answer_text.value = text
        page.update()

    def show_feedback(items):
        feedback_column.controls = [ft.Text(it, color=TEXT, size=14) for it in items]
        page.update()

    def enable_download(report_path):
        current_report["path"] = report_path
        download_btn.disabled = False
        download_btn.on_click = lambda _: file_picker.save_file(
            file_name=os.path.basename(report_path),
            allowed_extensions=["pdf"],
        )
        page.update()

    def run_agent():
        running["flag"] = True
        set_status("Running interview...")

        # Reset UI for new interview
        set_question("Question will appear here")
        set_answer("Your answer transcription will appear here")
        show_feedback([])
        download_btn.disabled = True
        current_report["path"] = None
        page.update()

        try:
            agent = VoiceAgent(
                interview_field=field_dd.value,
                num_questions=int(num_q.value),
                position_level=level_dd.value,
            )
            agent_ref["agent"] = agent
            current_report["path"] = None

            # Speak introduction with interview details
            set_status("Starting interview...")
            agent.introduce_interview()
            set_status("Interview in progress...")

            # Override: whenever a question is asked, update UI and play audio
            for idx in range(agent.max_questions):
                agent.question_count = idx + 1
                q = agent.generate_question()
                if not q:
                    break
                agent.interview_data["questions"].append(q)
                set_question(q)
                set_answer("(Listening...)")
                agent.text_to_speech(q)
                set_status(f"Asked question {idx + 1}")

                # Capture answer
                user_answer = agent.speech_to_text(max_duration=60, sample_rate=16000, silence_duration=4.0)
                agent.interview_data["answers"].append(user_answer)
                set_answer(user_answer)

            # Analyze
            feedback_items = []
            for q, a in zip(agent.interview_data["questions"], agent.interview_data["answers"]):
                fb = agent.analyze_answer(q, a)
                agent.interview_data["feedback"].append(fb)
                feedback_items.append(f"Q: {q}\nA: {a}\n{fb}")
            show_feedback(feedback_items)

            # Generate report and enable download
            pdf_path = agent.generate_report()
            if pdf_path:
                enable_download(pdf_path)

            set_status("Interview complete")
        except Exception as e:
            set_status(f"Error: {e}")
        finally:
            running["flag"] = False
            page.update()

    def start_interview():
        if running["flag"]:
            return
        try:
            n = int(num_q.value)
            if not (1 <= n <= 10):
                set_status("Enter questions between 1 and 10")
                return
        except ValueError:
            set_status("Enter a valid number of questions")
            return

        threading.Thread(target=run_agent, daemon=True).start()

    page.update()


if __name__ == "__main__":
    ft.app(target=main)
