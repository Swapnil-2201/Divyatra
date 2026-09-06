import os
import sys
import json
import time
import shutil
from pathlib import Path

def train_cctv_yolo():
    print("==================================================")
    print("   DIVYATRA CCTV YOLOv8 PERSON MODEL TRAINING")
    print("==================================================")

    import torch
    print(f"PyTorch Version: {torch.__version__}")
    print(f"CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"Device Name: {torch.cuda.get_device_name(0)}")
        print(f"Device VRAM: {torch.cuda.get_device_properties(0).total_memory / (1024**2):.1f} MB")
        device = 0
    else:
        print("WARNING: CUDA not available, using CPU.")
        device = "cpu"

    from ultralytics import YOLO

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_yaml = os.path.join(base_dir, "cctv_ai", "dataset", "data.yaml")
    models_dir = os.path.join(base_dir, "cctv_ai", "models")
    runs_dir = os.path.join(base_dir, "cctv_ai", "runs")
    os.makedirs(models_dir, exist_ok=True)

    print(f"Dataset YAML: {data_yaml}")
    if not os.path.exists(data_yaml):
        raise FileNotFoundError(f"data.yaml not found at {data_yaml}")

    # Initialize model with pretrained YOLOv8n weights
    print("\nLoading pretrained YOLOv8n backbone...")
    model = YOLO("yolov8n.pt")

    # Hyperparameters tuned for RTX 4050 6GB VRAM and high-accuracy CCTV inference
    epochs = 15
    batch_size = 16
    imgsz = 640
    lr0 = 0.01

    print(f"Training parameters: epochs={epochs}, batch={batch_size}, imgsz={imgsz}, lr0={lr0}, device={device}")
    start_time = time.time()

    # Train
    train_results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch_size,
        imgsz=imgsz,
        device=device,
        project=runs_dir,
        name="divyatra_cctv_yolov8n",
        exist_ok=True,
        workers=4 if device != "cpu" else 2,
        optimizer="AdamW",
        lr0=lr0,
        verbose=True,
        plots=True
    )

    training_time_sec = time.time() - start_time
    print(f"\nTraining completed in {training_time_sec / 60:.2f} minutes.")

    # Locate best.pt
    run_path = Path(runs_dir) / "divyatra_cctv_yolov8n"
    best_weight = run_path / "weights" / "best.pt"
    last_weight = run_path / "weights" / "last.pt"

    dest_best = os.path.join(models_dir, "best.pt")
    dest_last = os.path.join(models_dir, "last.pt")

    if best_weight.exists():
        shutil.copy(best_weight, dest_best)
        print(f"Best model weights saved to: {dest_best}")
    if last_weight.exists():
        shutil.copy(last_weight, dest_last)
        print(f"Last model weights saved to: {dest_last}")

    # Evaluate on Unseen Test Split
    print("\n==================================================")
    print("      EVALUATING MODEL ON UNSEEN TEST SET")
    print("==================================================")
    val_model = YOLO(dest_best if os.path.exists(dest_best) else str(best_weight))
    test_metrics = val_model.val(data=data_yaml, split="test", device=device, plots=True)

    # Extract metrics
    p = float(test_metrics.box.p[0]) if hasattr(test_metrics.box.p, '__getitem__') and len(test_metrics.box.p) > 0 else float(test_metrics.box.p)
    r = float(test_metrics.box.r[0]) if hasattr(test_metrics.box.r, '__getitem__') and len(test_metrics.box.r) > 0 else float(test_metrics.box.r)
    map50 = float(test_metrics.box.map50)
    map50_95 = float(test_metrics.box.map)
    speed_inference_ms = float(test_metrics.speed.get("inference", 0.0))

    metrics_summary = {
        "model": "YOLOv8n (DivYatra Fine-tuned)",
        "dataset": "DivYatra Unified Pedestrian CCTV Dataset",
        "precision": round(p, 4),
        "recall": round(r, 4),
        "mAP50": round(map50, 4),
        "mAP50-95": round(map50_95, 4),
        "inference_latency_ms": round(speed_inference_ms, 2),
        "inference_fps": round(1000.0 / speed_inference_ms, 1) if speed_inference_ms > 0 else 0,
        "epochs": epochs,
        "batch_size": batch_size,
        "training_time_minutes": round(training_time_sec / 60, 2),
        "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    print("\nFINAL REAL VALIDATION & TEST METRICS:")
    print(json.dumps(metrics_summary, indent=2))

    # Save metrics JSON
    metrics_file = os.path.join(models_dir, "training_metrics.json")
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"Metrics saved to: {metrics_file}")

if __name__ == "__main__":
    train_cctv_yolo()
