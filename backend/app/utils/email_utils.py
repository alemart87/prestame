import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_email(to_email, subject, body):
    """Función para enviar un correo electrónico."""
    
    msg = MIMEMultipart()
    msg['From'] = current_app.config['MAIL_SENDER']
    msg['To'] = to_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'html'))
    
    try:
        server = smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT'])
        server.starttls()
        server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
        text = msg.as_string()
        server.sendmail(current_app.config['MAIL_SENDER'], to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Error al enviar correo: {e}")
        return False 