import os
import sys
import time
import threading
import cv2
from fastapi import FastAPI, UploadFile, File, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from inference_engine import CCTVInferencePipeline

app = FastAPI(title="DivYatra Real-time CCTV Computer Vision Edge Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_dir = os.path.dirname(os.path.abspath(__file__))
sample_video_path = os.path.join(base_dir, "sample_cctv.mp4")
custom_video_path = os.path.join(base_dir, "uploaded_cctv.mp4")

# Global state
pipeline = CCTVInferencePipeline()
current_source = "sample"
source_lock = threading.Lock()
cap = None
active_camera_name = "Gate 1 Main Entry"

latest_telemetry = {
    "mode": "LIVE_AI_INFERENCE",
    "status": "INITIALIZING",
    "camera": active_camera_name,
    "headcount": 0,
    "fps": 30.0,
    "latencyMs": 20.0,
    "detectedBoxes": [],
    "zones": [],
    "alerts": [],
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
}

def open_capture():
    global cap, current_source
    if cap is not None:
        cap.release()
        cap = None

    if current_source == "webcam":
        print("Opening webcam (device 0)...")
        cap = cv2.VideoCapture(0)
    elif current_source == "upload" and os.path.exists(custom_video_path):
        print(f"Opening uploaded video: {custom_video_path}")
        cap = cv2.VideoCapture(custom_video_path)
    else:
        if not os.path.exists(sample_video_path):
            # Try to build sample video if missing
            try:
                from cctv_ai.create_sample_video import create_sample_video
                create_sample_video()
            except Exception as e:
                print(f"Could not build sample video: {e}")
        print(f"Opening sample CCTV video: {sample_video_path}")
        cap = cv2.VideoCapture(sample_video_path)

    if cap is None or not cap.isOpened():
        print(f"Warning: Failed to open video source '{current_source}'")

# Initialize capture
open_capture()

latest_frame_jpeg = None
stream_condition = threading.Condition()

def continuous_inference_loop():
    global cap, latest_telemetry, latest_frame_jpeg, active_camera_name
    print("🚀 Starting continuous background inference loop on RTX 4050...")
    while True:
        with source_lock:
            if cap is None or not cap.isOpened():
                open_capture()
                if cap is None or not cap.isOpened():
                    time.sleep(0.5)
                    continue

            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.2)
                    continue

            # Process frame with YOLOv8 fine-tuned model + Multi-Object Tracker
            annotated_frame, telemetry = pipeline.process_frame(frame, camera_name=active_camera_name)
            telemetry["source"] = current_source
            latest_telemetry = telemetry

            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if ret:
                with stream_condition:
                    latest_frame_jpeg = buffer.tobytes()
                    stream_condition.notify_all()

        # Target ~25-30 FPS
        time.sleep(0.035)

# Start background inference daemon thread
infer_thread = threading.Thread(target=continuous_inference_loop, daemon=True)
infer_thread.start()

def generate_frames():
    global latest_frame_jpeg
    while True:
        with stream_condition:
            stream_condition.wait(timeout=1.0)
            if latest_frame_jpeg is None:
                continue
            frame_bytes = latest_frame_jpeg

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


@app.get("/api/cctv/health")
def health():
    return {
        "status": "healthy",
        "service": "DivYatra Edge Computer Vision & Tracking Engine",
        "model": pipeline.model_name,
        "device": str(pipeline.device),
        "source": current_source,
        "camera": active_camera_name,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@app.get("/api/cctv/telemetry")
def get_telemetry():
    """
    Returns latest real-time computer vision telemetry:
    headcount, FPS, latency, detectedBoxes, zones, alerts.
    """
    return JSONResponse(content=latest_telemetry)

@app.get("/api/cctv/stream")
def video_stream():
    """
    Live MJPEG stream of CCTV feed with real-time AI bounding box overlay.
    """
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.post("/api/cctv/source")
async def set_source(
    source_type: str = Form(...),
    camera_name: str = Form(None),
    file: UploadFile = File(None)
):
    """
    Switch video source between:
    - 'sample' (Prerecorded Temple CCTV)
    - 'webcam' (Live Camera)
    - 'upload' (User-uploaded CCTV video file)
    """
    global current_source, active_camera_name
    with source_lock:
        if camera_name:
            active_camera_name = camera_name

        if source_type == "upload" and file is not None:
            contents = await file.read()
            with open(custom_video_path, "wb") as f:
                f.write(contents)
            current_source = "upload"
        elif source_type in ["sample", "webcam"]:
            current_source = source_type

        open_capture()

    return {
        "success": True,
        "activeSource": current_source,
        "cameraName": active_camera_name,
        "message": f"Switched CCTV source to '{current_source}'"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
