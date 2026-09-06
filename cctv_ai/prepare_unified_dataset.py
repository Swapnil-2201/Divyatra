import os
import sys
import zipfile
import shutil
from PIL import Image

def prepare_unified_dataset():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_dir = os.path.join(base_dir, "cctv_ai", "dataset")
    
    rgb_zip = os.path.join(base_dir, "Filtered Pedestrian.v1i.yolov8.zip")
    bg_zip = os.path.join(base_dir, "Human Detection Dataset.zip")
    
    print("==================================================")
    print("      DIVYATRA UNIFIED DATASET PREPARATION")
    print("==================================================")
    print(f"Target Directory: {target_dir}")
    
    # Create directory tree
    for split in ["train", "valid", "test"]:
        os.makedirs(os.path.join(target_dir, split, "images"), exist_ok=True)
        os.makedirs(os.path.join(target_dir, split, "labels"), exist_ok=True)
        
    # 1. Extract Primary Pedestrian Dataset
    print(f"\n[1/3] Extracting and validating RGB Pedestrian Dataset: {os.path.basename(rgb_zip)}")
    valid_counts = {"train": 0, "valid": 0, "test": 0}
    box_counts = {"train": 0, "valid": 0, "test": 0}
    quarantined = 0

    with zipfile.ZipFile(rgb_zip, "r") as zf:
        namelist = zf.namelist()
        for member in namelist:
            if member.endswith("/"):
                continue
            lower = member.lower()
            split = None
            if lower.startswith("train/"):
                split = "train"
            elif lower.startswith("valid/") or lower.startswith("val/"):
                split = "valid"
            elif lower.startswith("test/"):
                split = "test"
                
            if not split:
                continue
                
            fname = os.path.basename(member)
            if not fname:
                continue

            if "/images/" in lower:
                dest_path = os.path.join(target_dir, split, "images", fname)
                with open(dest_path, "wb") as f:
                    f.write(zf.read(member))
                valid_counts[split] += 1
            elif "/labels/" in lower:
                # Sanitize and validate bounding boxes
                raw_lines = zf.read(member).decode("utf-8", errors="ignore").splitlines()
                clean_lines = []
                for line in raw_lines:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        try:
                            # Harmonize class to 0 (person)
                            cls_id = 0
                            xc = float(parts[1])
                            yc = float(parts[2])
                            w = float(parts[3])
                            h = float(parts[4])
                            
                            # Sanity check normalized coordinates
                            if 0.0 <= xc <= 1.0 and 0.0 <= yc <= 1.0 and 0.0 < w <= 1.0 and 0.0 < h <= 1.0:
                                # Clamp min-max to exactly [0, 1]
                                xc = max(0.0, min(1.0, xc))
                                yc = max(0.0, min(1.0, yc))
                                w = max(0.001, min(1.0, w))
                                h = max(0.001, min(1.0, h))
                                clean_lines.append(f"{cls_id} {xc:.6f} {yc:.6f} {w:.6f} {h:.6f}")
                                box_counts[split] += 1
                            else:
                                quarantined += 1
                        except ValueError:
                            quarantined += 1
                            
                dest_path = os.path.join(target_dir, split, "labels", fname)
                with open(dest_path, "w", encoding="utf-8") as f:
                    f.write("\n".join(clean_lines))

    print(f"Extracted Images: {valid_counts}")
    print(f"Extracted Valid Bounding Boxes: {box_counts}")
    print(f"Quarantined/Discarded Invalid Boxes: {quarantined}")

    # 2. Extract Negative Background Samples from Human Detection Dataset (0/ folder)
    print(f"\n[2/3] Adding Negative/Background Samples from: {os.path.basename(bg_zip)}")
    bg_added = {"train": 0, "valid": 0}
    if os.path.exists(bg_zip):
        with zipfile.ZipFile(bg_zip, "r") as zf:
            bg_files = [n for n in zf.namelist() if "/0/" in n and n.lower().endswith((".png", ".jpg", ".jpeg"))]
            print(f"Total non-human background candidates: {len(bg_files)}")
            
            # Select 250 for train, 50 for val to suppress false positives in empty corridors
            for i, member in enumerate(bg_files[:300]):
                split = "train" if i < 250 else "valid"
                fname = f"bg_neg_{i}_{os.path.basename(member)}"
                
                # Write image
                dest_img = os.path.join(target_dir, split, "images", fname)
                with open(dest_img, "wb") as f:
                    f.write(zf.read(member))
                    
                # Write corresponding empty label file
                lbl_fname = os.path.splitext(fname)[0] + ".txt"
                dest_lbl = os.path.join(target_dir, split, "labels", lbl_fname)
                with open(dest_lbl, "w", encoding="utf-8") as f:
                    pass # Empty file signifies background / no objects
                bg_added[split] += 1

    print(f"Added Background Samples: {bg_added}")

    # 3. Create unified data.yaml
    print("\n[3/3] Generating unified data.yaml")
    # Use forward slashes for cross-platform YOLO compatibility
    clean_target_path = target_dir.replace("\\", "/")
    yaml_content = f"""# DivYatra Edge CCTV Unified Person Detection Dataset
path: {clean_target_path}
train: train/images
val: valid/images
test: test/images

nc: 1
names:
  0: person
"""
    yaml_path = os.path.join(target_dir, "data.yaml")
    with open(yaml_path, "w", encoding="utf-8") as f:
        f.write(yaml_content)
    print(f"data.yaml created at: {yaml_path}")
    print("\nDataset preparation complete!")

if __name__ == "__main__":
    prepare_unified_dataset()
