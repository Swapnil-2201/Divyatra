import os
import glob
import cv2

def create_sample_video():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_img_dir = os.path.join(base_dir, "cctv_ai", "dataset", "test", "images")
    output_dir = os.path.join(base_dir, "cctv_service")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "sample_cctv.mp4")

    # Find test images
    img_files = sorted(glob.glob(os.path.join(test_img_dir, "*.jpg")) + glob.glob(os.path.join(test_img_dir, "*.png")))
    if not img_files:
        print("No test images found to build sample video.")
        return

    print(f"Creating sample CCTV video from {min(200, len(img_files))} test images...")
    # Standard resolution for CCTV stream
    target_w, target_h = 1280, 720
    fps = 15

    # Try MP4V codec
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (target_w, target_h))

    # Take 150 frames and loop smoothly
    selected = img_files[:150]
    for p in selected:
        img = cv2.imread(p)
        if img is not None:
            resized = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_AREA)
            out.write(resized)

    # Add reverse sequence for a smooth loop
    for p in reversed(selected[1:-1]):
        img = cv2.imread(p)
        if img is not None:
            resized = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_AREA)
            out.write(resized)

    out.release()
    print(f"Sample CCTV video created at: {output_path} ({os.path.getsize(output_path) / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    create_sample_video()
