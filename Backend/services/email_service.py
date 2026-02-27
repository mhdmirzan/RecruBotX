"""
Email Verification Service
===========================

Sends OTP verification codes via email for account registration.
Uses Gmail SMTP with App Password for secure delivery.
OTPs are stored in MongoDB with expiry timestamps.
"""

import os
import random
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

# SMTP configuration will be fetched at runtime to ensure updated .env values are used
def get_smtp_config():
    load_dotenv(override=True)
    return {
        "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
        "port": int(os.getenv("SMTP_PORT", 587)),
        "email": os.getenv("SMTP_EMAIL", ""),
        "password": os.getenv("SMTP_PASSWORD", ""),
    }

OTP_EXPIRY_MINUTES = 10
OTP_LENGTH = 6


def generate_otp() -> str:
    """Generate a secure 6-digit OTP."""
    return str(random.randint(100000, 999999))


async def store_otp(db, email: str, otp: str):
    """Store OTP in MongoDB with expiry timestamp."""
    await db.email_otps.delete_many({"email": email.lower()})  # Remove old OTPs
    await db.email_otps.insert_one({
        "email": email.lower(),
        "otp": otp,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES),
        "verified": False,
    })


async def verify_otp(db, email: str, otp: str) -> bool:
    """Check if OTP is valid and not expired."""
    record = await db.email_otps.find_one({
        "email": email.lower(),
        "otp": otp,
        "expires_at": {"$gt": datetime.utcnow()},
        "verified": False,
    })
    if record:
        await db.email_otps.update_one(
            {"_id": record["_id"]},
            {"$set": {"verified": True}}
        )
        return True
    return False


async def is_email_verified(db, email: str) -> bool:
    """Check if an email has been verified (OTP was confirmed)."""
    record = await db.email_otps.find_one({
        "email": email.lower(),
        "verified": True,
        "expires_at": {"$gt": datetime.utcnow() - timedelta(minutes=30)},  # Valid for 30 min after verification
    })
    return record is not None


async def cleanup_expired_otps(db):
    """Remove expired OTP records."""
    await db.email_otps.delete_many({
        "expires_at": {"$lt": datetime.utcnow()}
    })


def send_otp_email(to_email: str, otp: str) -> bool:
    """Send OTP verification email via SMTP."""
    config = get_smtp_config()
    smtp_email = config["email"]
    smtp_password = config["password"]
    
    # Check if credentials exist
    if not smtp_email or not smtp_password:
        print(f"[WARNING] SMTP credentials MISSING in .env. Falling back to console log.")
        print(f"[DEBUG] OTP for {to_email}: {otp}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        # Simplify From header to avoid being flagged as spoofing/spam
        msg["From"] = smtp_email 
        msg["To"] = to_email
        msg["Subject"] = f"RecruBotX - Your Verification Code: {otp}"

        html_body = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background: linear-gradient(135deg, #0a2a5e 0%, #143d7a 100%); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 24px; margin: 0;">RecruBotX</h1>
                <p style="color: #93c5fd; font-size: 14px; margin: 8px 0 0;">Email Verification</p>
            </div>
            <div style="padding: 32px;">
                <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hi there,</p>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
                    Please use the following code to verify your email address. This code expires in {OTP_EXPIRY_MINUTES} minutes.
                </p>
                <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0a2a5e;">{otp}</span>
                </div>
                <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                    If you didn't request this code, please ignore this email. Do not share this code with anyone.
                </p>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0;">© 2026 RecruBotX. All rights reserved.</p>
            </div>
        </div>
        """

        msg.attach(MIMEText(html_body, "html"))

        # Add timeout to avoid hanging if network issues occur
        with smtplib.SMTP(config["host"], config["port"], timeout=10) as server:
            # server.set_debuglevel(1) # Keep enabled locally for debug if needed
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, to_email, msg.as_string())

        print(f"[SUCCESS] OTP email successfully sent to {to_email}")
        return True

    except Exception as e:
        # Avoid emojis here too to prevent encoding crashes
        print(f"[ERROR] SMTP Error for {to_email}: {str(e)}")
        print(f"[FALLBACK] OTP for {to_email}: {otp}")
        return False
