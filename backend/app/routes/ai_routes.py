import json
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.openai_service import OpenAIService
from app.models import db, AIConversation

ai_bp = Blueprint('ai_bp', __name__, url_prefix='/api/ai')

@ai_bp.route('/test-thread-creation', methods=['GET'])
def test_thread_creation():
    """
    Endpoint de prueba para verificar la creación de threads sin autenticación.
    Este endpoint es solo para desarrollo y pruebas.
    """
    try:
        openai_service = OpenAIService()
        thread_id = openai_service.create_thread()
        return jsonify({"success": True, "thread_id": thread_id, "message": "Thread creado correctamente."})
    except Exception as e:
        current_app.logger.error(f"Error en la prueba de creación de thread: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat_with_assistant():
    """
    Gestiona la conversación entre un usuario y el asistente de IA.
    Crea un hilo de conversación si no existe.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    message_content = data.get('message')

    if not message_content:
        return jsonify({"error": "El mensaje no puede estar vacío."}), 400

    try:
        # Crear instancia del servicio OpenAI
        openai_service = OpenAIService()
        thread_id = None
        
        # Usar directamente la base de datos a través de current_app
        from flask import current_app
        from app.models.ai_conversation import AIConversation
        from app import db
        
        # Buscar o crear la conversación en la BD
        ai_conversation = AIConversation.query.filter_by(user_id=user_id).first()
        
        if not ai_conversation:
            # Crear thread en OpenAI
            thread_id = openai_service.create_thread()
            current_app.logger.info(f"Nuevo thread creado para usuario {user_id}: {thread_id}")
            
            # Guardar en BD manualmente
            ai_conversation = AIConversation(user_id=user_id, thread_id=thread_id)
            db.session.add(ai_conversation)
            db.session.commit()
            current_app.logger.info(f"Conversación guardada en la base de datos")
        else:
            thread_id = ai_conversation.thread_id
            current_app.logger.info(f"Usando thread existente: {thread_id}")
        
        # Añadir el mensaje del usuario al hilo
        openai_service.add_message_to_thread(thread_id, message_content)
        
        # Obtener la respuesta del asistente
        assistant_response = openai_service.get_assistant_response(thread_id)
        
        return jsonify({"reply": assistant_response})
    
    except Exception as e:
        current_app.logger.error(f"Error en el endpoint de chat: {e}")
        # En caso de error, intentar hacer rollback para evitar que la sesión quede en mal estado
        try:
            db.session.rollback()
        except:
            pass
        return jsonify({"error": "Ha ocurrido un error interno."}), 500

@ai_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_conversation():
    """
    Analiza la conversación del usuario actual y devuelve los resultados.
    """
    user_id = get_jwt_identity()
    
    # Verificar que existe una conversación para este usuario
    ai_conversation = AIConversation.query.filter_by(user_id=user_id).first()
    if not ai_conversation:
        return jsonify({"error": "No existe una conversación activa para este usuario."}), 404
    
    thread_id = ai_conversation.thread_id
    if not thread_id:
        return jsonify({"error": "No se ha iniciado una conversación con el asistente."}), 400

    try:
        openai_service = OpenAIService()
        
        # Obtener la transcripción completa
        current_app.logger.info("Obteniendo transcripción completa...")
        transcript = openai_service.get_full_transcript(thread_id)
        current_app.logger.info(f"Transcripción obtenida. Longitud: {len(transcript)} caracteres")
        
        if not transcript.strip() or len(transcript.strip().split('\n')) < 2:
             current_app.logger.error("Conversación demasiado corta para análisis")
             return jsonify({"error": "La conversación es muy corta para ser analizada."}), 400
        
        # Analizar la conversación
        current_app.logger.info("Enviando transcripción completa a OpenAI para análisis...")
        analysis_json_str = openai_service.analyze_conversation_transcript(transcript)
        current_app.logger.info("Respuesta de análisis recibida de OpenAI")
        
        # Intentar parsear el JSON
        current_app.logger.info("Parseando respuesta JSON...")
        try:
            analysis_data = json.loads(analysis_json_str)
            current_app.logger.info(f"Puntuación lingüística: {analysis_data.get('linguistic_score')}")
        except json.JSONDecodeError as e:
            current_app.logger.error(f"Error al parsear JSON de respuesta: {e}")
            return jsonify({"error": "Error al procesar la respuesta del análisis."}), 500
        
        # Verificar que los datos estén presentes y tengan el formato correcto
        score = analysis_data.get('linguistic_score')
        summary = analysis_data.get('analysis_summary')
        key_indicators = analysis_data.get('key_indicators', [])
        
        if score is None or summary is None:
            current_app.logger.error("Faltan campos obligatorios en la respuesta")
            return jsonify({"error": "La respuesta del análisis está incompleta."}), 500
        
        # Asegurar que score es un entero
        if not isinstance(score, int):
            try:
                if isinstance(score, str) and score.strip():
                    # Limpiar la cadena de caracteres no numéricos
                    score_str = ''.join(c for c in score if c.isdigit() or c == '.')
                    if score_str:
                        score = int(float(score_str))
                    else:
                        score = 50
                else:
                    score = int(float(score))
            except (ValueError, TypeError) as e:
                current_app.logger.warning(f"No se pudo convertir la puntuación a entero: {e}. Usando valor por defecto")
                score = 50
        
        # Asegurar que esté en el rango correcto
        score = max(0, min(100, score))
        
        # Verificar que el resumen es una cadena no vacía
        if not summary or not isinstance(summary, str):
            summary = "No se pudo generar un análisis detallado."
        
        # Verificar que key_indicators es una lista
        if not isinstance(key_indicators, list):
            key_indicators = []
        
        # Guardar los resultados en la base de datos
        current_app.logger.info("Guardando resultados en la base de datos...")
        
        try:
            # Crear una nueva sesión para evitar problemas con sesiones caducadas
            from app import db
            
            # Obtener la conversación actual de nuevo para evitar problemas de sesión
            db_conversation = AIConversation.query.filter_by(user_id=user_id).first()
            if db_conversation:
                # Actualizar los campos
                db_conversation.linguistic_score = score
                db_conversation.linguistic_analysis = summary
                db_conversation.set_key_indicators(key_indicators)  # Guardar indicadores clave
                
                # Asegurar que se actualiza el campo updated_at
                from datetime import datetime
                db_conversation.updated_at = datetime.utcnow()
                
                # Commit los cambios
                db.session.commit()
                current_app.logger.info(f"Análisis guardado correctamente en la base de datos. Score: {score}, Indicadores: {len(key_indicators)}")
            else:
                current_app.logger.error("No se pudo obtener la conversación para actualizar")
                return jsonify({"error": "Error al acceder a los datos de la conversación"}), 500
                
        except Exception as db_error:
            db.session.rollback()
            current_app.logger.error(f"Error al guardar en la base de datos: {str(db_error)}")
            return jsonify({"error": f"Error al guardar el análisis: {str(db_error)}"}), 500

        # Incluir los indicadores clave en la respuesta
        analysis_response = {
            "message": "Análisis completado y guardado con indicadores clave.",
            "analysis": {
                "linguistic_score": score,
                "analysis_summary": summary,
                "key_indicators": key_indicators
            }
        }
        
        return jsonify(analysis_response)

    except json.JSONDecodeError as je:
        current_app.logger.error(f"Error al decodificar el JSON de la API de OpenAI para el análisis: {je}")
        current_app.logger.error(f"Respuesta recibida: {analysis_json_str[:200] if 'analysis_json_str' in locals() else 'No disponible'}...")
        return jsonify({"error": "Error al procesar la respuesta del análisis."}), 500
        
    except Exception as e:
        current_app.logger.error(f"Error general en el análisis: {str(e)}")
        return jsonify({"error": f"Ha ocurrido un error al realizar el análisis: {str(e)}"}), 500

@ai_bp.route('/conversation', methods=['GET'])
@jwt_required()
def get_conversation_history():
    """
    Devuelve el historial de la conversación y el último análisis.
    """
    user_id = get_jwt_identity()
    
    ai_conversation = AIConversation.query.filter_by(user_id=user_id).first()
        
    if not ai_conversation or not ai_conversation.thread_id:
        return jsonify({"history": [], "analysis": None})

    try:
        openai_service = OpenAIService()
        
        # Obtener mensajes usando nuestro cliente HTTP
        response = openai_service.http_client.get(
            f"{openai_service.api_base_url}/threads/{ai_conversation.thread_id}/messages",
            headers=openai_service.headers,
            params={"order": "asc"}
        )
        response.raise_for_status()
        messages_data = response.json()
        
        history = []
        for msg in messages_data.get("data", []):
            sender = 'user' if msg.get("role") == 'user' else 'assistant'
            content = msg.get("content", [{}])[0].get("text", {}).get("value", "")
            history.append({'sender': sender, 'message': content})

        analysis = {
            "score": ai_conversation.linguistic_score,
            "summary": ai_conversation.linguistic_analysis,
            "key_indicators": ai_conversation.get_key_indicators(),  # Incluir indicadores clave
            "updated_at": ai_conversation.updated_at.isoformat() if ai_conversation.updated_at and ai_conversation.linguistic_score is not None else None
        }

        return jsonify({"history": history, "analysis": analysis})

    except Exception as e:
        current_app.logger.error(f"Error al recuperar el historial de conversación: {e}")
        return jsonify({"error": "Ha ocurrido un error interno."}), 500

@ai_bp.route('/test-chat', methods=['POST'])
def test_chat():
    """
    Endpoint de prueba para el chat sin autenticación.
    Este endpoint es solo para desarrollo y pruebas.
    """
    data = request.get_json()
    message_content = data.get('message')

    if not message_content:
        return jsonify({"error": "El mensaje no puede estar vacío."}), 400

    try:
        # Crear instancia del servicio OpenAI
        openai_service = OpenAIService()
        
        # Crear un nuevo thread para cada conversación de prueba
        thread_id = openai_service.create_thread()
        current_app.logger.info(f"Thread de prueba creado: {thread_id}")
        
        # Añadir el mensaje del usuario al hilo
        openai_service.add_message_to_thread(thread_id, message_content)
        
        # Obtener la respuesta del asistente
        assistant_response = openai_service.get_assistant_response(thread_id)
        
        return jsonify({"reply": assistant_response})
        
    except Exception as e:
        current_app.logger.error(f"Error en el endpoint de chat de prueba: {e}")
        return jsonify({"error": "Ha ocurrido un error interno."}), 500 