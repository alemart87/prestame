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
            current_app.logger.info(f"Iniciando análisis financiero del thread completo")
            
            # En lugar de analizar manualmente, le pedimos a OpenAI que haga el análisis financiero
            analysis_prompt = """
            Eres un experto analista financiero. Analiza esta conversación completa con un cliente y proporciona:

            1. Una puntuación de fiabilidad crediticia del 0 al 100 basada en:
               - Estabilidad de ingresos mencionada
               - Historial crediticio comentado
               - Actitud hacia las deudas y pagos
               - Transparencia en las respuestas
               - Consistencia en la información proporcionada

            2. Un resumen ejecutivo del perfil financiero del cliente

            3. Indicadores clave identificados en la conversación

            Responde ÚNICAMENTE en formato JSON válido con esta estructura exacta:
            {
                "linguistic_score": [número del 0 al 100],
                "analysis_summary": "[resumen ejecutivo del análisis financiero]",
                "key_indicators": ["indicador1", "indicador2", "indicador3"]
            }

            Conversación a analizar:
            """ + transcript

            current_app.logger.info("Enviando solicitud de análisis financiero a OpenAI...")
            
            # Verificar API key
            if not self.api_key or len(self.api_key) < 20:
                current_app.logger.error("API key de OpenAI no válida")
                raise ValueError("API key de OpenAI no válida para análisis")
                
            # Headers actualizados
            self.headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Solicitud a OpenAI para análisis financiero
            response = self.http_client.post(
                f"{self.api_base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "gpt-4o",
                    "messages": [
                        {
                            "role": "system",
                            "content": "Eres un experto analista financiero especializado en evaluación crediticia."
                        },
                        {
                            "role": "user", 
                            "content": analysis_prompt
                        }
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.3  # Más determinístico para análisis financiero
                },
                timeout=60.0
            )
            
            current_app.logger.info(f"Respuesta de análisis recibida. Status: {response.status_code}")
            
            if response.status_code != 200:
                current_app.logger.error(f"Error en análisis OpenAI: {response.text}")
                raise Exception(f"Error de OpenAI en análisis: {response.status_code}")
                
            result = response.json()
            analysis_content = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            
            current_app.logger.info(f"Análisis recibido: {analysis_content[:100]}...")
            
            # Parsear el JSON de respuesta
            try:
                analysis_json = json.loads(analysis_content)
            except json.JSONDecodeError as e:
                current_app.logger.error(f"Error parseando JSON de análisis: {e}")
                # Fallback si el JSON está mal formateado
                analysis_json = {
                    "linguistic_score": 50,
                    "analysis_summary": "No se pudo completar el análisis debido a un error de formato.",
                    "key_indicators": ["Error en formato de respuesta"]
                }
            
            # Validar y limpiar los datos
            if 'linguistic_score' not in analysis_json:
                analysis_json['linguistic_score'] = 50
                
            if 'analysis_summary' not in analysis_json:
                analysis_json['analysis_summary'] = "Análisis no disponible."
                
            if 'key_indicators' not in analysis_json:
                analysis_json['key_indicators'] = ["No se identificaron indicadores"]
            
            # Asegurar que la puntuación esté en rango válido
            try:
                score = int(analysis_json['linguistic_score'])
                analysis_json['linguistic_score'] = max(0, min(100, score))
            except (ValueError, TypeError):
                analysis_json['linguistic_score'] = 50
                
            current_app.logger.info(f"Análisis completado. Puntuación: {analysis_json['linguistic_score']}")
            
            return json.dumps(analysis_json)
            
        except Exception as e:
            current_app.logger.error(f"Error en análisis financiero: {str(e)}")
            # Fallback para cualquier error
            fallback_analysis = {
                "linguistic_score": 50,
                "analysis_summary": f"Error al procesar el análisis financiero: {str(e)}",
                "key_indicators": ["Error en procesamiento"]
            }
            return json.dumps(fallback_analysis)

    def get_full_transcript(self, thread_id):
        try:
            current_app.logger.info(f"Obteniendo transcripción completa del thread: {thread_id}")
            
            # Verificar API key
            if not self.api_key or len(self.api_key) < 20:
                current_app.logger.error("API key de OpenAI no válida")
                raise ValueError("API key de OpenAI no válida")
                
            # Headers para API de threads
            self.headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "OpenAI-Beta": "assistants=v2"
            }
            
            # Obtener todos los mensajes del thread
            response = self.http_client.get(
                f"{self.api_base_url}/threads/{thread_id}/messages",
                headers=self.headers,
                params={"order": "asc", "limit": 100}  # Obtener hasta 100 mensajes
            )
            
            current_app.logger.info(f"Respuesta de mensajes recibida. Status: {response.status_code}")
            
            if response.status_code != 200:
                current_app.logger.error(f"Error obteniendo mensajes: {response.text}")
                raise Exception(f"Error al obtener mensajes: {response.status_code}")
                
            messages_data = response.json()
            
            # Construir transcripción completa
            transcript = "=== CONVERSACIÓN FINANCIERA ===\n\n"
            
            for msg in messages_data.get("data", []):
                role = msg.get("role")
                content_blocks = msg.get("content", [])
                
                if content_blocks and len(content_blocks) > 0:
                    content = content_blocks[0].get("text", {}).get("value", "")
                    
                    if role == "user":
                        transcript += f"CLIENTE: {content}\n\n"
                    elif role == "assistant":
                        transcript += f"KATUPYRY-IA: {content}\n\n"
            
            transcript += "=== FIN DE CONVERSACIÓN ===\n"
            
            current_app.logger.info(f"Transcripción construida. Longitud: {len(transcript)} caracteres")
            current_app.logger.info(f"Número de mensajes procesados: {len(messages_data.get('data', []))}")
            
            return transcript
            
        except Exception as e:
            current_app.logger.error(f"Error obteniendo transcripción del thread {thread_id}: {e}")
            raise 