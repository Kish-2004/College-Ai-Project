import base64
import io
import logging
from pathlib import Path

import imagehash
from cachetools import TTLCache
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Application Setup ---
app = FastAPI(title="Vehicle Damage API")

# Build a robust path to the model file relative to this script
SCRIPT_DIR = Path(__file__).parent
MODEL_PATH = SCRIPT_DIR / "runs/segment/run_phase1/weights/best.pt"
model = None

# --- Fraud Check Cache ---
processed_hashes = TTLCache(maxsize=10000, ttl=3600)

# --- Events ---
@app.on_event("startup")
def load_model():
    """Load the YOLO model when the application starts."""
    global model
    if not MODEL_PATH.exists():
        logger.error(f"❌ Model file not found at {MODEL_PATH}")
        return
    try:
        model = YOLO(MODEL_PATH)
        logger.info(f"✅ Successfully loaded model from {MODEL_PATH}")
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")

# --- CORS Middleware (for frontend access) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change "*" to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---
@app.get("/")
def read_root():
    """Root endpoint with a welcome message."""
    return {"message": "Welcome! The main endpoint is at /ml/analyze. Visit /docs for more."}

@app.get("/health")
def health_check():
    """Health check endpoint to verify model status."""
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/ml/analyze")
async def analyze_damage(file: UploadFile = File(...)):
    """
    Receives an image and returns a full analysis including classification,
    damage locations, severity, and the plotted image.
    """
    if not model:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    logger.info(f"📥 [Analyze] Received file: {file.filename}")
    contents = await file.read()

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # --- Basic Fraud Check ---
        hash_value = str(imagehash.phash(image))
        if hash_value in processed_hashes:
            raise HTTPException(status_code=409, detail="Potential duplicate image detected.")
        processed_hashes[hash_value] = True

        # --- Run Inference ---
        results = model(image)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image or prediction error: {e}")

    # --- Process and Format Results ---
    locations = []
    has_damage = False
    highest_confidence = 0.0
    plotted_image_base64 = ""

    for r in results:
        # Generate and encode the image with bounding boxes
        im_array = r.plot()  
        im = Image.fromarray(im_array[..., ::-1]) 
        buffered = io.BytesIO()
        im.save(buffered, format="JPEG")
        plotted_image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        if r.boxes and len(r.boxes) > 0:
            has_damage = True
            for box in r.boxes:
                locations.append({
                    "location": model.names[int(box.cls[0])],
                    "confidence": round(box.conf[0].item(), 6)
                })
                if box.conf[0].item() > highest_confidence:
                    highest_confidence = box.conf[0].item()

    # --- Mock Severity Calculation (based on highest confidence) ---
    severity_label = "low"
    if highest_confidence > 0.75:
        severity_label = "high"
    elif highest_confidence > 0.4:
        severity_label = "moderate"

    # --- Construct Final JSON Response ---
    return {
        "isCar": True,
        "isDamaged": has_damage,
        "damageConfidence": round(highest_confidence, 6),
        "damageLocations": locations,
        "damageSeverity": {
            "severityLabel": severity_label,
            "severityConfidence": round(highest_confidence, 6)
        },
        "plottedImage": plotted_image_base64
    }