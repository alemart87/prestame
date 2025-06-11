import os
import json
import logging
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.borrower import BorrowerProfile
from app.models.lender import LenderProfile
from app.models.loan import LoanRequest
from app.models.lead import Lead
from app.utils.paraguay_scraper import search_real_leads_paraguay

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scraper_bp = Blueprint('scraper_bp', __name__, url_prefix='/api/scraper')

@scraper_bp.route('/find-leads', methods=['POST'])
@jwt_required()
def find_leads_with_scraper():
    """
    Busca leads reales en sitios web paraguayos usando web scraping
    """
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convertir a entero
        user = User.query.get(user_id)
        
        if not user or not user.lender_profile:
            return jsonify({"msg": "Solo los prestamistas pueden realizar esta acción"}), 403

        lender_profile = user.lender_profile
        logger.info(f"Créditos disponibles: {lender_profile.ai_search_credits}")

        if lender_profile.ai_search_credits <= 0:
            logger.error(f"Usuario {user_id} sin créditos de búsqueda")
            return jsonify({"msg": "No tienes suficientes créditos de búsqueda"}), 400

        data = request.get_json()
        logger.info(f"Datos recibidos: {data}")
        
        if not data:
            logger.error("No se recibieron datos JSON")
            return jsonify({"msg": "No se recibieron datos"}), 400
            
        prompt = data.get('prompt')
        logger.info(f"Prompt extraído: {prompt}")

        if not prompt:
            logger.error("Prompt vacío o no proporcionado")
            return jsonify({"msg": "La descripción del cliente ideal es requerida"}), 400

        logger.info(f"Iniciando búsqueda avanzada de leads reales para usuario {user_id} con prompt: {prompt}")
        logger.info(f"Fuentes disponibles: LinkedIn, Facebook, MercadoLibre, Directorios Empresariales")

        limit = data.get('limit', 15)
        leads_data = search_real_leads_paraguay(prompt, limit=limit)

        if not leads_data:
            return jsonify({"msg": "No se encontraron leads con los criterios especificados"}), 404

        try:
            scraper_user = User.query.filter_by(email='scraper@prestame.com.py').first()
            
            if not scraper_user:
                scraper_user = User(
                    email='scraper@prestame.com.py',
                    password='scraper_temp',
                    first_name='Scraper',
                    last_name='Paraguay',
                    user_type='borrower',
                    phone='+595 21 000000'
                )
                db.session.add(scraper_user)
                db.session.flush()
            
            scraper_borrower = BorrowerProfile.query.filter_by(user_id=scraper_user.id).first()
            
            if not scraper_borrower:
                scraper_borrower = BorrowerProfile(
                    user_id=scraper_user.id,
                    monthly_income=3000000,
                    monthly_expenses=2000000,
                    debt_to_income_ratio=0.67,
                    employment_status='Independiente',
                    job_title='Lead del Scraper',
                    employer='Datos Reales Paraguay'
                )
                db.session.add(scraper_borrower)
                db.session.flush()
            
            scraper_borrower_id = scraper_borrower.id
            
        except Exception as e:
            logger.error(f"Error creando usuario/borrower temporal: {str(e)}")
            db.session.rollback()
            return jsonify({"msg": "Error interno del servidor"}), 500

        created_leads = []
        for lead_info in leads_data:
            try:
                loan_request = LoanRequest(
                    borrower_profile_id=scraper_borrower_id,
                    amount=lead_info.get('loan_amount', 5000000),
                    purpose=f"Capital de trabajo para {lead_info.get('business_type', 'negocio')}",
                    payment_frequency='monthly',
                    term_months=12,
                    status='pending',
                    description=json.dumps(lead_info)
                )
                db.session.add(loan_request)
                db.session.flush()

                lead = Lead(
                    lender_id=lender_profile.id,
                    loan_request_id=loan_request.id,
                    status='new',
                    notes=json.dumps(lead_info)
                )
                db.session.add(lead)

                created_leads.append({
                    'contact_info': lead_info,
                    'loan_amount': loan_request.amount,
                    'purpose': loan_request.purpose
                })

            except Exception as e:
                logger.error(f"Error creando lead individual: {str(e)}")
                continue

        lender_profile.ai_search_credits -= 1
        db.session.commit()

        logger.info(f"Búsqueda completada. {len(created_leads)} leads creados para usuario {user_id}")

        return jsonify({
            "msg": f"Búsqueda completada exitosamente. Se encontraron {len(created_leads)} leads reales.",
            "leads_found": len(created_leads),
            "leads": created_leads,
            "remaining_credits": lender_profile.ai_search_credits,
            "search_type": "real_data_scraping"
        }), 200

    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        logger.error(f"Error en búsqueda de leads: {str(e)}")
        db.session.rollback()
        return jsonify({"msg": f"Error interno del servidor: {str(e)}"}), 500

@scraper_bp.route('/search-status', methods=['GET'])
@jwt_required()
def get_search_status():
    """
    Obtiene el estado de las búsquedas del usuario
    """
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        user = User.query.get(user_id)
        
        if not user or not user.lender_profile:
            return jsonify({"msg": "Solo los prestamistas pueden realizar esta acción"}), 403

        lender_profile = user.lender_profile
        
        total_leads = Lead.query.filter_by(lender_id=lender_profile.id).count()
        new_leads = Lead.query.filter_by(lender_id=lender_profile.id, status='new').count()
        contacted_leads = Lead.query.filter_by(lender_id=lender_profile.id, contacted=True).count()

        return jsonify({
            "credits_remaining": lender_profile.ai_search_credits,
            "total_leads": total_leads,
            "new_leads": new_leads,
            "contacted_leads": contacted_leads,
            "search_type": "real_data_scraping"
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Token inválido'}), 422
    except Exception as e:
        logger.error(f"Error obteniendo estado de búsqueda: {str(e)}")
        return jsonify({"msg": "Error interno del servidor"}), 500

@scraper_bp.route('/test-scraper', methods=['GET'])
def test_scraper():
    """
    Endpoint de prueba para verificar que el scraper funciona
    """
    try:
        test_prompt = "Comerciantes de Asunción que vendan ropa"
        logger.info(f"Probando scraper con prompt: {test_prompt}")
        
        leads_data = search_real_leads_paraguay(test_prompt)
        
        return jsonify({
            "msg": "Scraper funcionando correctamente",
            "test_prompt": test_prompt,
            "leads_found": len(leads_data) if leads_data else 0,
            "sample_leads": leads_data[:3] if leads_data else [],
            "search_type": "real_data_scraping"
        }), 200
        
    except Exception as e:
        logger.error(f"Error en test del scraper: {str(e)}")
        return jsonify({"msg": f"Error en el scraper: {str(e)}"}), 500 