import os
import time
import json
import httpx
from flask import current_app

# --- Variables de Configuración del Asistente ---
ASSISTANT_NAME = "Katupyry-IA"
ASSISTANT_MODEL = "gpt-4o" # Actualizado al modelo más reciente
ASSISTANT_INSTRUCTIONS = """
Eres "Katupyry-IA", un sofisticado analista de fiabilidad financiera para la plataforma de préstamos "Prestame".
Tu propósito es evaluar la fiabilidad y el carácter de los solicitantes de préstamos a través de una conversación amigable y natural. No pides documentos ni cifras exactas, sino que exploras la actitud del usuario hacia la responsabilidad financiera, sus planes a futuro y su consistencia.

Tu personalidad: Eres amable, empático, profesional y muy perspicaz. Usas un lenguaje claro y accesible, preferiblemente guaraní y español para que el usuario se sienta comodo. Tu objetivo es construir confianza.

Tus reglas:
1.  **Nunca** des consejos financieros ni prometas la aprobación de un préstamo.
2.  **No** preguntes por datos personales sensibles como contraseñas, números de tarjeta, etc. Solo puedes conversar sobre la información que el usuario comparte voluntariamente sobre su situación laboral, sus hábitos, etc.
3.  Mantén las conversaciones relativamente cortas y al punto, sin parecer apurado.
4.  Guía la conversación para tocar sutilmente temas como:
    - Estabilidad (laboral, de vida).
    - Planificación a futuro (¿para qué es el préstamo? ¿cuáles son sus metas?).
    - Actitud ante imprevistos.
    - Honestidad y consistencia en sus respuestas.
5.  Inicia la conversación presentándote y explicando tu propósito de forma sencilla. Por ejemplo: "¡Hola! Soy Katupyry-IA, tu asistente en Prestame. Estoy aquí para conversar un poco contigo y conocerte mejor. ¿Cómo estás hoy?"
"""

ANALYSIS_PROMPT = """
Analiza la siguiente transcripción de una conversación entre un solicitante de préstamo y un agente de IA ("Katupyry-IA").
Tu tarea es evaluar la fiabilidad del solicitante basándote exclusivamente en sus respuestas. Genera un "Índice de Fiabilidad Lingüística" y un análisis cualitativo.

**Transcripción:**
{transcript}

**Análisis Requerido:**
Devuelve tu análisis en formato JSON con la siguiente estructura:
{
  "linguistic_score": <un número entero entre 0 y 100, donde 100 es la máxima fiabilidad>,
  "analysis_summary": "<un párrafo explicando las razones de tu puntuación. Menciona indicadores clave como consistencia, evasión de respuestas, tono, claridad en los planes, actitud ante el riesgo, etc.>",
  "key_indicators": ["<indicador_1>", "<indicador_2>", "..."]
}
"""

class OpenAIService:
    def __init__(self):
        try:
            self.api_key = os.getenv("OPENAI_API_KEY")
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY no encontrada en las variables de entorno.")
                
            # Registrar información sobre la clave API (solo primeros y últimos caracteres para seguridad)
            current_app.logger.info(f"OpenAI API Key: {self.api_key[:5]}...{self.api_key[-5:] if len(self.api_key) > 10 else ''}")
            current_app.logger.info(f"Longitud de la API Key: {len(self.api_key)} caracteres")
            
            # Validar formato de la API key
            if not self.api_key.startswith("sk-"):
                current_app.logger.warning("El formato de la API key no parece ser estándar. Debería comenzar con 'sk-'")
                
            # Inicialización del cliente OpenAI a través de la API REST
            self.api_base_url = "https://api.openai.com/v1"
            self.headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "OpenAI-Beta": "assistants=v2"  # Actualizado a v2
            }
            self.http_client = httpx.Client(timeout=60.0)
            self.assistant = None
        except Exception as e:
            current_app.logger.error(f"Error inicializando OpenAIService: {e}")
            raise

    def get_or_create_assistant(self):
        if self.assistant:
            return self.assistant

        try:
            # Listar asistentes existentes
            response = self.http_client.get(
                f"{self.api_base_url}/assistants",
                headers=self.headers,
                params={"limit": 10}
            )
            response.raise_for_status()
            assistants_data = response.json()
            
            # Buscar asistente existente por nombre
            for assistant in assistants_data.get("data", []):
                if assistant.get("name") == ASSISTANT_NAME:
                    self.assistant = assistant
                    current_app.logger.info(f"Asistente '{ASSISTANT_NAME}' encontrado con ID: {self.assistant['id']}")
                    return self.assistant
            
            # Crear un nuevo asistente si no existe
            current_app.logger.info(f"No se encontró el asistente '{ASSISTANT_NAME}'. Creando uno nuevo...")
            response = self.http_client.post(
                f"{self.api_base_url}/assistants",
                headers=self.headers,
                json={
                    "name": ASSISTANT_NAME,
                    "instructions": ASSISTANT_INSTRUCTIONS,
                    "tools": [],
                    "model": ASSISTANT_MODEL
                }
            )
            response.raise_for_status()
            self.assistant = response.json()
            current_app.logger.info(f"Asistente '{ASSISTANT_NAME}' creado con ID: {self.assistant['id']}")
            return self.assistant
            
        except Exception as e:
            current_app.logger.error(f"Error en get_or_create_assistant: {e}")
            raise

    def create_thread(self):
        try:
            # Intentar crear un thread con un formato explícito
            url = f"{self.api_base_url}/threads"
            headers = self.headers.copy()
            
            # Según la documentación actual, un objeto JSON vacío debería funcionar
            # pero vamos a probar con un formato más explícito
            payload = {}
            
            current_app.logger.info(f"Intentando crear thread con URL: {url}")
            current_app.logger.info(f"Headers: {headers}")
            current_app.logger.info(f"Payload: {payload}")
            
            response = self.http_client.post(url, headers=headers, json=payload)
            
            current_app.logger.info(f"Respuesta status: {response.status_code}")
            current_app.logger.info(f"Respuesta texto: {response.text[:500]}")  # Limitar a 500 caracteres por si es muy largo
            
            response.raise_for_status()
            thread_data = response.json()
            thread_id = thread_data.get("id")
            current_app.logger.info(f"Thread creado con ID: {thread_id}")
            return thread_id
        except Exception as e:
            current_app.logger.error(f"Error al crear thread de OpenAI: {e}")
            current_app.logger.error(f"Detalles del error: {str(e)}")
            raise

    def add_message_to_thread(self, thread_id, message_content, role="user"):
        try:
            response = self.http_client.post(
                f"{self.api_base_url}/threads/{thread_id}/messages",
                headers=self.headers,
                json={
                    "role": role,
                    "content": message_content
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            current_app.logger.error(f"Error al añadir mensaje al thread {thread_id}: {e}")
            raise

    def get_assistant_response(self, thread_id):
        try:
            assistant = self.get_or_create_assistant()
            
            # Crear un run
            response = self.http_client.post(
                f"{self.api_base_url}/threads/{thread_id}/runs",
                headers=self.headers,
                json={
                    "assistant_id": assistant["id"]
                }
            )
            response.raise_for_status()
            run_data = response.json()
            run_id = run_data.get("id")
            
            # Esperar a que el run se complete
            status = run_data.get("status")
            while status in ['queued', 'in_progress', 'cancelling']:
                time.sleep(1)
                response = self.http_client.get(
                    f"{self.api_base_url}/threads/{thread_id}/runs/{run_id}",
                    headers=self.headers
                )
                response.raise_for_status()
                run_data = response.json()
                status = run_data.get("status")

            if status == 'completed':
                # Obtener los mensajes
                response = self.http_client.get(
                    f"{self.api_base_url}/threads/{thread_id}/messages",
                    headers=self.headers,
                    params={"order": "desc"}
                )
                response.raise_for_status()
                messages_data = response.json()
                
                # Buscar la respuesta del asistente (último mensaje)
                for message in messages_data.get("data", []):
                    if message.get("role") == "assistant":
                        return message.get("content", [{}])[0].get("text", {}).get("value", "No se recibió contenido de la respuesta.")
                
                return "No se recibió respuesta del asistente."
            else:
                current_app.logger.error(f"El 'run' de OpenAI falló con estado: {status}")
                return "Ocurrió un error al procesar tu solicitud."

        except Exception as e:
            current_app.logger.error(f"Error al obtener respuesta del asistente para el thread {thread_id}: {e}")
            raise

    def analyze_conversation_transcript(self, transcript):
        try:
            current_app.logger.info(f"Analizando transcripción de conversación. Longitud total: {len(transcript)} caracteres. Primeros 100 caracteres (solo para log): {transcript[:100]}...")
            
            # Verificar que la transcripción tiene suficiente contenido
            if len(transcript) < 50:
                current_app.logger.warning("La transcripción es muy corta para un análisis significativo")
                return json.dumps({
                    "linguistic_score": 0,
                    "analysis_summary": "La conversación es demasiado corta para realizar un análisis significativo.",
                    "key_indicators": ["Conversación insuficiente"]
                })
                
            prompt = ANALYSIS_PROMPT.format(transcript=transcript)
            current_app.logger.info(f"Prompt formateado para análisis. Longitud: {len(prompt)} caracteres")
            current_app.logger.info("NOTA: Se está enviando la transcripción COMPLETA para análisis")
            
            # Verificar que la API key es válida antes de continuar
            if not self.api_key or len(self.api_key) < 20:
                current_app.logger.error(f"API key de OpenAI no válida o demasiado corta: {self.api_key[:5]}...")
                raise ValueError("API key de OpenAI no válida para análisis")
                
            # Actualizar headers para asegurar que la API key es correcta
            self.headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "OpenAI-Beta": "assistants=v2"
            }
            
            current_app.logger.info("Enviando solicitud a OpenAI para análisis...")
            response = self.http_client.post(
                f"{self.api_base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "gpt-4o",  # Actualizado al modelo más reciente
                    "messages": [
                        {
                            "role": "system",
                            "content": prompt
                        }
                    ],
                    "response_format": {"type": "json_object"}
                },
                timeout=60.0  # Aumentar timeout para asegurar respuesta
            )
            
            current_app.logger.info(f"Respuesta recibida de OpenAI. Código de estado: {response.status_code}")
            
            if response.status_code != 200:
                current_app.logger.error(f"Error en la respuesta de OpenAI: {response.text}")
                raise Exception(f"Error de OpenAI: {response.status_code}")
                
            response.raise_for_status()
            result = response.json()
            
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            current_app.logger.info(f"Contenido de la respuesta recibida (primeros 100 caracteres, solo para log): {content[:100]}...")
            
            # Limpiar el contenido y formatear correctamente
            content = content.strip()
            
            # Limpiar caracteres problemáticos que puedan aparecer al inicio
            if content.startswith('\n'):
                content = content.lstrip('\n')
                current_app.logger.warning(f"Se eliminaron saltos de línea al inicio: {content[:50]}...")
                
            # Reconstruir JSON si es necesario
            try:
                # Intentar cargar el JSON tal como está
                parsed_json = json.loads(content)
            except json.JSONDecodeError as je:
                current_app.logger.warning(f"Error al decodificar JSON: {je}, intentando reparar...")
                
                # Intentar reparar el JSON antes de cargarlo
                if not content.startswith('{'):
                    content = '{' + content.split('{', 1)[1] if '{' in content else '{"linguistic_score": 50}'
                
                if not content.endswith('}'):
                    content = content.rstrip() + '}'
                
                try:
                    parsed_json = json.loads(content)
                except json.JSONDecodeError:
                    # Si todavía falla, crear un objeto JSON básico
                    parsed_json = {
                        "linguistic_score": 50,
                        "analysis_summary": "No fue posible analizar la conversación debido a un error de formato.",
                        "key_indicators": ["Error en el formato de respuesta"]
                    }
            
            # Asegurar que tenga los campos requeridos
            if 'linguistic_score' not in parsed_json:
                parsed_json['linguistic_score'] = 50  # Valor por defecto
                current_app.logger.warning("Campo 'linguistic_score' no encontrado, asignando valor por defecto")
            
            if 'analysis_summary' not in parsed_json:
                parsed_json['analysis_summary'] = "No fue posible generar un análisis detallado."
                current_app.logger.warning("Campo 'analysis_summary' no encontrado, asignando valor por defecto")
            
            if 'key_indicators' not in parsed_json:
                parsed_json['key_indicators'] = ["No se identificaron indicadores clave"]
                current_app.logger.warning("Campo 'key_indicators' no encontrado, asignando valor por defecto")
            
            # Asegurar que la puntuación es un entero
            try:
                # Manejar tanto string como número
                if isinstance(parsed_json['linguistic_score'], str):
                    # Limpiar posibles caracteres no numéricos
                    score_str = ''.join(c for c in parsed_json['linguistic_score'] if c.isdigit() or c == '.')
                    if score_str:
                        parsed_json['linguistic_score'] = int(float(score_str))
                    else:
                        parsed_json['linguistic_score'] = 50
                else:
                    parsed_json['linguistic_score'] = int(parsed_json['linguistic_score'])
            except (ValueError, TypeError) as e:
                current_app.logger.warning(f"Error al convertir puntuación: {e}. Estableciendo valor por defecto")
                parsed_json['linguistic_score'] = 50
                
            # Asegurar que la puntuación está en el rango correcto (0-100)
            if parsed_json['linguistic_score'] < 0 or parsed_json['linguistic_score'] > 100:
                current_app.logger.warning(f"Puntuación fuera de rango: {parsed_json['linguistic_score']}, ajustando...")
                parsed_json['linguistic_score'] = max(0, min(100, parsed_json['linguistic_score']))
            
            # Devolver el JSON completo y bien formateado
            return json.dumps(parsed_json)
                
        except Exception as e:
            current_app.logger.error(f"Error al analizar la transcripción: {str(e)}")
            # Crear un JSON manual como fallback para cualquier error
            fallback_json = {
                "linguistic_score": 50,
                "analysis_summary": f"Error al procesar el análisis: {str(e)}",
                "key_indicators": ["Error en el procesamiento"]
            }
            return json.dumps(fallback_json)
    
    def get_full_transcript(self, thread_id):
        try:
            current_app.logger.info(f"Solicitando mensajes para el thread: {thread_id}")
            current_app.logger.info(f"URL de solicitud: {self.api_base_url}/threads/{thread_id}/messages")
            
            # Verificar que la API key es válida
            if not self.api_key or len(self.api_key) < 20:
                current_app.logger.error(f"API key de OpenAI no válida o demasiado corta: {self.api_key[:5]}...")
                raise ValueError("API key de OpenAI no válida")
                
            current_app.logger.info(f"Autenticación: Bearer {self.api_key[:5]}...{self.api_key[-5:] if len(self.api_key) > 10 else ''}")
            
            # Actualizar headers para asegurar que la API key es correcta
            self.headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "OpenAI-Beta": "assistants=v2"
            }
            
            response = self.http_client.get(
                f"{self.api_base_url}/threads/{thread_id}/messages",
                headers=self.headers,
                params={"order": "asc"}
            )
            
            current_app.logger.info(f"Respuesta recibida. Código de estado: {response.status_code}")
            
            if response.status_code != 200:
                current_app.logger.error(f"Error en la respuesta: {response.text}")
                raise Exception(f"Error al obtener mensajes de OpenAI: {response.status_code}")
            
            response.raise_for_status()
            messages_data = response.json()
            
            transcript = ""
            for msg in messages_data.get("data", []):
                role = "Solicitante" if msg.get("role") == 'user' else "Katupyry-IA"
                content = msg.get("content", [{}])[0].get("text", {}).get("value", "")
                transcript += f"{role}: {content}\n"
            
            current_app.logger.info(f"Transcripción obtenida correctamente. Longitud: {len(transcript)} caracteres")
            return transcript
            
        except Exception as e:
            current_app.logger.error(f"Error al obtener la transcripción del thread {thread_id}: {e}")
            raise 