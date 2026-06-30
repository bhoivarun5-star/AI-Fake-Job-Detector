import os
import joblib
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Paths to trained model artifacts
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'detector_app', 'ml_models')
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
MODEL_PATH = os.path.join(MODEL_DIR, "job_classifier.joblib")

# Global variables for model lazy-loading
_vectorizer = None
_model = None

def load_ml_model():
    global _vectorizer, _model
    if _vectorizer is None or _model is None:
        if os.path.exists(VECTORIZER_PATH) and os.path.exists(MODEL_PATH):
            _vectorizer = joblib.load(VECTORIZER_PATH)
            _model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError("Trained model files not found. Please run the training script first.")
    return _vectorizer, _model

def check_connection(request):
    return JsonResponse({"message": "connected successfully"})

@csrf_exempt
def detect_fake_job(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        data = json.loads(request.body)
        title = data.get('title', '').strip()
        company_profile = data.get('company_profile', '').strip()
        description = data.get('description', '').strip()
        requirements = data.get('requirements', '').strip()

        if not any([title, company_profile, description, requirements]):
            return JsonResponse({"error": "Please provide at least one job field to analyze."}, status=400)

        # Lazy load model artifacts
        try:
            vectorizer, model = load_ml_model()
        except FileNotFoundError as fnf:
            return JsonResponse({
                "status": "error",
                "error": str(fnf),
                "instructions": "Run 'python train_model.py' to download the dataset and train the model."
            }, status=503)

        # Preprocess and combine inputs exactly like in training
        combined_text = f"{title} {company_profile} {description} {requirements}"

        # Vectorize text and predict
        features = vectorizer.transform([combined_text])
        prediction = int(model.predict(features)[0]) # 1 = fraudulent, 0 = genuine
        probabilities = model.predict_proba(features)[0] # [prob_real, prob_fake]
        
        real_prob = float(probabilities[0])
        fake_prob = float(probabilities[1])

        # Generate a list of scam risk flags based on simple text heuristics
        risk_flags = []
        lowered_text = combined_text.lower()
        if "bank account" in lowered_text or "routing number" in lowered_text or "wire transfer" in lowered_text:
            risk_flags.append("Requests bank account or wiring information.")
        if "fee" in lowered_text or "pay upfront" in lowered_text or "buy equipment" in lowered_text or "payment upfront" in lowered_text:
            risk_flags.append("Requests upfront payments, fees, or buying equipment.")
        if "whatsapp" in lowered_text or "telegram" in lowered_text or "google hangouts" in lowered_text:
            risk_flags.append("Requests communicating via chat platforms (WhatsApp, Telegram).")
        if len(company_profile) < 10:
            risk_flags.append("Vague or missing company profile details.")
        if fake_prob > 0.6:
            risk_flags.append("Linguistic patterns match known scam job listings.")

        return JsonResponse({
            "status": "success",
            "prediction": prediction,  # 1 for fake, 0 for real
            "label": "High Risk (Scam Alert)" if prediction == 1 else "Low Risk (Safe Listing)",
            "fraud_probability": round(fake_prob * 100, 2),
            "safe_probability": round(real_prob * 100, 2),
            "risk_flags": risk_flags
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
