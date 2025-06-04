from fastapi_mail import FastMail, MessageSchema
from backend.utils.mail_config import conf


class EmailVerificationMethods:
    def __init__(self):
        pass

    async def send_verification_email(self, to_email: str, token: str):
        verification_link = f"http://localhost:8000/verify-email?token={token}"

        message = MessageSchema(
            subject="Verify your email address",
            recipients=[to_email],
            body=f"""
            <p>Hi there,</p>
            <p>Thank you for registering. Please verify your email by clicking the link below:</p>
            <a href="{verification_link}">{verification_link}</a>
            <p>If you didn’t create an account, just ignore this email.</p>
            """,
            subtype="html",
        )

        fm = FastMail(conf)
        await fm.send_message(message)
