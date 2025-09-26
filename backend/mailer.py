import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(recipient_email, subject, body, emailSender, emailPassword):
    """
    Send an email using Gmail SMTP.
    
    :param sender_email: Gmail address of the sender
    :param sender_password: App password or Gmail password (if less secure apps enabled)
    :param recipient_email: Recipient email address
    :param subject: Subject of the email
    :param body: Body text of the email
    """
    print("✅ Email sent out!")
    try:
        # Create the email
        msg = MIMEMultipart()
        msg["From"] = emailSender
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Connect to Gmail SMTP server
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Secure the connection
            server.login(emailSender, emailPassword)
            server.send_message(msg)

        print("✅ Email sent successfully!")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")