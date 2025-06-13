import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = current_app.config.get('SMTP_SERVER')
        self.smtp_port = int(current_app.config.get('SMTP_PORT', 587))
        self.username = current_app.config.get('SMTP_USERNAME')
        self.password = current_app.config.get('SMTP_PASSWORD')
        self.sender = current_app.config.get('MAIL_SENDER')

    def send_email(self, to_email, subject, html_content, text_content=None):
        """Envía un email con contenido HTML y texto plano"""
        try:
            # Crear el mensaje
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.sender
            msg['To'] = to_email

            # Agregar contenido de texto plano si se proporciona
            if text_content:
                part1 = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(part1)

            # Agregar contenido HTML
            part2 = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(part2)

            # Crear conexión SMTP
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()  # Habilitar encriptación
            server.login(self.username, self.password)
            
            # Enviar el mensaje
            text = msg.as_string()
            server.sendmail(self.sender, to_email, text)
            server.quit()

            logger.info(f"Email enviado exitosamente a {to_email}")
            return True

        except Exception as e:
            logger.error(f"Error enviando email a {to_email}: {str(e)}")
            return False

    def send_borrower_welcome_email(self, user):
        """Email de bienvenida para prestatarios"""
        subject = "¡Bienvenido a PRESTAME! 🚀 Tu plataforma de educación financiera con IA"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; font-weight: bold; }}
                .header p {{ color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px; }}
                .content {{ padding: 40px 30px; }}
                .welcome-text {{ font-size: 18px; color: #2d3748; margin-bottom: 30px; line-height: 1.6; }}
                .feature-box {{ background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                .feature-title {{ font-size: 18px; font-weight: bold; color: #2d3748; margin-bottom: 10px; }}
                .feature-desc {{ color: #4a5568; line-height: 1.5; }}
                .cta-button {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
                .footer {{ background: #2d3748; color: #a0aec0; padding: 30px; text-align: center; }}
                .ai-badge {{ background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Bienvenido a PRESTAME!</h1>
                    <p>La plataforma de educación financiera con Inteligencia Artificial</p>
                    <div class="ai-badge">🤖 POWERED BY AI</div>
                </div>
                
                <div class="content">
                    <p class="welcome-text">
                        Hola <strong>{user.first_name}</strong>,<br><br>
                        ¡Estamos emocionados de tenerte en PRESTAME! Has dado el primer paso hacia una mejor educación financiera y acceso a préstamos inteligentes.
                    </p>

                    <div class="feature-box">
                        <div class="feature-title">🤖 Asesor Financiero con IA - Katupyry</div>
                        <div class="feature-desc">
                            Nuestro asistente de IA analiza tu perfil financiero en tiempo real y te brinda recomendaciones personalizadas. 
                            Chatea con Katupyry para obtener consejos sobre préstamos, inversiones y planificación financiera.
                        </div>
                    </div>

                    <div class="feature-box">
                        <div class="feature-title">📊 Sistema de Scoring Dual</div>
                        <div class="feature-desc">
                            <strong>Score Katupyry:</strong> Evaluación tradicional basada en tu historial crediticio.<br>
                            <strong>Score IA:</strong> Análisis avanzado de tu conversación y comportamiento financiero.<br>
                            <em>Tu Score Final combina ambos para darte las mejores oportunidades.</em>
                        </div>
                    </div>

                    <div class="feature-box">
                        <div class="feature-title">💰 Solicitud de Préstamos Inteligente</div>
                        <div class="feature-desc">
                            Conectamos tu perfil con prestamistas que se ajustan a tus necesidades. 
                            Nuestro algoritmo encuentra las mejores opciones basadas en tu Score Final.
                        </div>
                    </div>

                    <div class="feature-box">
                        <div class="feature-title">📈 Educación Financiera Personalizada</div>
                        <div class="feature-desc">
                            Aprende sobre finanzas personales, inversiones y manejo de deudas con contenido 
                            adaptado a tu nivel y objetivos específicos.
                        </div>
                    </div>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{current_app.config.get('CORS_ORIGINS', 'https://prestame.com')}/financial-analysis" class="cta-button">
                            🚀 Comenzar con el Asesor IA
                        </a>
                    </div>

                    <p style="color: #4a5568; font-style: italic; text-align: center;">
                        "La educación financiera es la clave para la libertad económica" - Equipo PRESTAME
                    </p>
                </div>

                <div class="footer">
                    <p><strong>PRESTAME</strong> - Educación Financiera con IA</p>
                    <p>¿Necesitas ayuda? Responde a este email o visita nuestro centro de ayuda.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(user.email, subject, html_content)

    def send_lender_welcome_email(self, user):
        """Email de bienvenida para prestamistas"""
        subject = "¡Bienvenido a PRESTAME! 💼 Invierte inteligentemente con IA"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
                .header {{ background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 20px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; font-weight: bold; }}
                .header p {{ color: #c6f6d5; margin: 10px 0 0 0; font-size: 16px; }}
                .content {{ padding: 40px 30px; }}
                .welcome-text {{ font-size: 18px; color: #2d3748; margin-bottom: 30px; line-height: 1.6; }}
                .pricing-box {{ background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%); border: 2px solid #48bb78; padding: 25px; margin: 20px 0; border-radius: 12px; text-align: center; }}
                .price {{ font-size: 32px; font-weight: bold; color: #48bb78; }}
                .feature-list {{ text-align: left; margin: 20px 0; }}
                .feature-list li {{ margin: 8px 0; color: #4a5568; }}
                .quality-badge {{ background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 8px 16px; border-radius: 25px; font-size: 14px; font-weight: bold; display: inline-block; margin: 10px 5px; }}
                .cta-button {{ display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
                .footer {{ background: #2d3748; color: #a0aec0; padding: 30px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Bienvenido a PRESTAME!</h1>
                    <p>Invierte en leads de calidad premium con IA</p>
                </div>
                
                <div class="content">
                    <p class="welcome-text">
                        Hola <strong>{user.first_name}</strong>,<br><br>
                        ¡Excelente decisión! Te has unido a la plataforma de inversión en préstamos más avanzada de Paraguay. 
                        Nuestros leads están pre-calificados con IA para maximizar tu ROI.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <div class="quality-badge">🎯 LEADS PREMIUM</div>
                        <div class="quality-badge">🤖 IA VERIFICADOS</div>
                        <div class="quality-badge">📊 SCORING DUAL</div>
                    </div>

                    <div class="pricing-box">
                        <h3 style="color: #2d3748; margin-top: 0;">💰 Precios Competitivos</h3>
                        <div class="price">€1.00 <span style="font-size: 16px; color: #4a5568;">por lead</span></div>
                        <p style="color: #4a5568; margin: 15px 0;">Mínimo 15 leads - Máximo 900 leads</p>
                        
                        <div class="feature-list">
                            <strong>✅ Cada lead incluye:</strong>
                            <li>📱 Información de contacto verificada</li>
                            <li>💰 Monto de préstamo solicitado</li>
                            <li>📊 Score Katupyry (tradicional)</li>
                            <li>🤖 Score IA (análisis conversacional)</li>
                            <li>📈 Score Final combinado</li>
                            <li>🎯 Propósito del préstamo</li>
                            <li>⏰ Datos actualizados en tiempo real</li>
                        </div>
                    </div>

                    <div style="background: #f7fafc; padding: 25px; border-radius: 12px; margin: 25px 0;">
                        <h3 style="color: #2d3748; margin-top: 0;">🔍 Cómo Calificamos los Leads</h3>
                        <p><strong>1. Análisis Tradicional (70%):</strong> Historial crediticio, ingresos, estabilidad laboral</p>
                        <p><strong>2. IA Conversacional (30%):</strong> Análisis de patrones de comunicación, intenciones, comportamiento financiero</p>
                        <p><strong>3. Bonificaciones:</strong> Indicadores clave como estabilidad, transparencia, planificación</p>
                        <p style="color: #48bb78; font-weight: bold;">🎯 Resultado: Leads con mayor probabilidad de pago y menor riesgo</p>
                    </div>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{current_app.config.get('CORS_ORIGINS', 'https://prestame.com')}/subscriptions" class="cta-button">
                            🛒 Comprar Leads Ahora
                        </a>
                    </div>

                    <div style="background: #edf2f7; padding: 20px; border-radius: 8px; text-align: center;">
                        <p style="color: #4a5568; margin: 0; font-style: italic;">
                            "Nuestros prestamistas reportan un 40% más de conversión comparado con leads tradicionales"
                        </p>
                    </div>
                </div>

                <div class="footer">
                    <p><strong>PRESTAME</strong> - Inversión Inteligente con IA</p>
                    <p>¿Preguntas sobre precios o leads? Responde a este email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(user.email, subject, html_content)

    def send_payment_confirmation_email(self, user, purchase_details):
        """Email de confirmación de pago"""
        subject = "¡Pago Confirmado! 🎉 Tus leads están listos"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; }}
                .header {{ background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%); padding: 40px 20px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; font-weight: bold; }}
                .content {{ padding: 40px 30px; }}
                .success-box {{ background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%); border: 2px solid #48bb78; padding: 25px; margin: 20px 0; border-radius: 12px; text-align: center; }}
                .purchase-details {{ background: #f7fafc; padding: 25px; border-radius: 12px; margin: 25px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }}
                .cta-button {{ display: inline-block; background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
                .tips-box {{ background: #fff5f5; border-left: 4px solid #f56565; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                .footer {{ background: #2d3748; color: #a0aec0; padding: 30px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Pago Confirmado! 🎉</h1>
                    <p style="color: #e9d8fd; margin: 10px 0 0 0;">Tus leads están listos para usar</p>
                </div>
                
                <div class="content">
                    <div class="success-box">
                        <h2 style="color: #22543d; margin-top: 0;">✅ Compra Exitosa</h2>
                        <p style="color: #2f855a; font-size: 18px; margin: 0;">
                            Gracias por confiar en PRESTAME. Tu inversión está asegurada.
                        </p>
                    </div>

                    <div class="purchase-details">
                        <h3 style="color: #2d3748; margin-top: 0;">📋 Detalles de tu Compra</h3>
                        <div class="detail-row">
                            <span><strong>Leads Comprados:</strong></span>
                            <span style="color: #9f7aea; font-weight: bold;">{purchase_details.get('quantity', 0)} leads</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>Precio por Lead:</strong></span>
                            <span>€1.00</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>Total Pagado:</strong></span>
                            <span style="color: #48bb78; font-weight: bold;">€{purchase_details.get('total_amount', 0)}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>Leads Disponibles:</strong></span>
                            <span style="color: #9f7aea; font-weight: bold;">{purchase_details.get('total_credits', 0)} leads</span>
                        </div>
                    </div>

                    <div class="tips-box">
                        <h3 style="color: #c53030; margin-top: 0;">💡 Cómo Usar tus Leads</h3>
                        <p><strong>1.</strong> Ve a la sección "Leads" en tu dashboard</p>
                        <p><strong>2.</strong> Filtra por Score Final (recomendamos empezar con scores >70)</p>
                        <p><strong>3.</strong> Cada lead te costará 1 crédito al visualizar la información completa</p>
                        <p><strong>4.</strong> Contacta directamente a los prestatarios usando los datos proporcionados</p>
                        <p style="color: #c53030; font-weight: bold;">⚠️ Los créditos se consumen al ver los detalles del lead, úsalos sabiamente</p>
                    </div>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{current_app.config.get('CORS_ORIGINS', 'https://prestame.com')}/leads" class="cta-button">
                            🎯 Ver Mis Leads
                        </a>
                    </div>

                    <div style="background: #edf2f7; padding: 20px; border-radius: 8px; text-align: center;">
                        <p style="color: #4a5568; margin: 0;">
                            <strong>¿Necesitas más leads?</strong><br>
                            Compra más créditos cuando los necesites. Sin suscripciones, solo paga por lo que uses.
                        </p>
                    </div>
                </div>

                <div class="footer">
                    <p><strong>PRESTAME</strong> - Tu socio en inversiones inteligentes</p>
                    <p>¿Preguntas? Responde a este email o contacta soporte.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(user.email, subject, html_content) 