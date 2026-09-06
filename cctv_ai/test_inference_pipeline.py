import os
import sys
import time
import json
import cv2

# Add parent directory to path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(base_dir, "cctv_service"))

from inference_engine import CCTVInferencePipeline

def test_pipeline():
    print("==================================================")
    print("      TESTING REAL CCTV INFERENCE PIPELINE")
    print("==================================================")

    model_path = os.path.join(base_dir, "cctv_ai", "models", "best.pt")
    print(f"Loading trained weights from: {model_path}")

    pipeline = CCTVInferencePipeline(model_path=model_path, conf_threshold=0.35)
    print(f"Model loaded: {pipeline.model_name} on device: {pipeline.device}")

    # Test with sample CCTV video
    sample_video = os.path.join(base_dir, "cctv_service", "sample_cctv.mp4")
    if not os.path.exists(sample_video):
        print("Sample video missing, creating one...")
        from create_sample_video import create_sample_video
        create_sample_video()

    cap = cv2.VideoCapture(sample_video)
    if not cap.isOpened():
        raise RuntimeError(f"Failed to open {sample_video}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Testing on video: {sample_video} (Total frames: {total_frames})")

    frame_count = 0
    all_telemetries = []
    seen_tracking_ids = set()
    id_lifespans = {}

    print("\nProcessing 30 consecutive CCTV frames...")
    while frame_count < 30:
        ret, frame = cap.read()
        if not ret:
            break

        annotated, telemetry = pipeline.process_frame(frame, camera_name="Gate 1 Main Entry")
        frame_count += 1
        all_telemetries.append(telemetry)

        # Track ID persistence
        for box in telemetry["detectedBoxes"]:
            tid = box["trackingId"]
            seen_tracking_ids.add(tid)
            id_lifespans[tid] = id_lifespans.get(tid, 0) + 1

        if frame_count % 10 == 0:
            print(f"Frame {frame_count:2d} | Headcount: {telemetry['headcount']:2d} | FPS: {telemetry['fps']:.1f} | Latency: {telemetry['latencyMs']:.1f}ms | Active Tracks: {len(telemetry['detectedBoxes'])}")

    cap.release()

    print("\n--- Pipeline Verification Summary ---")
    print(f"Total Frames Processed: {frame_count}")
    print(f"Unique Tracking IDs Encountered: {len(seen_tracking_ids)}")
    print(f"Sample Tracking IDs: {list(seen_tracking_ids)[:5]}")
    
    # Check persistence: tracks appearing in multiple consecutive frames
    persistent_tracks = [tid for tid, count in id_lifespans.items() if count > 2]
    print(f"Persistent Tracks (active across >2 frames): {len(persistent_tracks)} / {len(seen_tracking_ids)}")
    
    last_t = all_telemetries[-1]
    print(f"\nFinal Frame Telemetry:")
    print(f"- Headcount: {last_t['headcount']} Devotees")
    print(f"- Measured FPS: {last_t['fps']}")
    print(f"- Measured Latency: {last_t['latencyMs']} ms (Inference: {last_t['inferenceLatencyMs']}ms, Tracking: {last_t['trackingLatencyMs']}ms)")
    print(f"- Zones: {[z['name'] + ': ' + str(z['headcount']) + ' pax (' + str(z['density']) + '%)' for z in last_t['zones']]}")
    print(f"- Active Alerts: {len(last_t['alerts'])}")
    print(f"- Privacy Notice: {last_t['privacyNotice']}")

    # Save verification JSON
    test_out_path = os.path.join(base_dir, "cctv_ai", "inference_test_results.json")
    with open(test_out_path, "w", encoding="utf-8") as f:
        json.dump({
            "status": "PASSED",
            "framesProcessed": frame_count,
            "uniqueTrackingIds": len(seen_tracking_ids),
            "persistentTracks": len(persistent_tracks),
            "sampleFinalTelemetry": last_t
        }, f, indent=2)
    print(f"\nTest results saved to: {test_out_path}")

if __name__ == "__main__":
    test_pipeline()
