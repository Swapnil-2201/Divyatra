import os
import sys
import zipfile
import hashlib
import io
from collections import Counter, defaultdict
from PIL import Image, ImageDraw, ImageFont
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def audit_datasets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    audit_dir = os.path.join(base_dir, "dataset_audit")
    sample_labels_dir = os.path.join(audit_dir, "sample_labels")
    os.makedirs(sample_labels_dir, exist_ok=True)

    print("==================================================")
    print("      DIVYATRA DATASET AUDIT & VALIDATION")
    print("==================================================")

    datasets = [
        {
            "id": "dataset1",
            "name": "Roboflow Filtered Pedestrian",
            "zip": os.path.join(base_dir, "Filtered Pedestrian.v1i.yolov8.zip"),
            "expected_format": "YOLOv8 bounding boxes",
            "domain": "RGB CCTV / Street Pedestrian"
        },
        {
            "id": "dataset2",
            "name": "Kaggle Thermal Images for Human Detection",
            "zip": os.path.join(base_dir, "Thermal Images For Human Detection.zip"),
            "expected_format": "YOLO bounding boxes",
            "domain": "Thermal Infrared"
        },
        {
            "id": "dataset3",
            "name": "Kaggle Human Detection Dataset",
            "zip": os.path.join(base_dir, "Human Detection Dataset.zip"),
            "expected_format": "Binary Classification (0/1)",
            "domain": "RGB Web / Scene Images"
        }
    ]

    report_lines = []
    duplicate_lines = []
    stats_for_chart = {}

    def log(line=""):
        print(line)
        report_lines.append(line)

    log(f"DivYatra CCTV Dataset Audit Report")
    log(f"Auditor: DivYatra AI Computer Vision Subsystem\n")

    for ds in datasets:
        log("--------------------------------------------------")
        log(f"DATASET: {ds['name']}")
        log(f"Archive: {os.path.basename(ds['zip'])}")
        log(f"Domain: {ds['domain']}")
        log(f"Expected Format: {ds['expected_format']}")

        if not os.path.exists(ds["zip"]):
            log(f"ERROR: Archive {ds['zip']} not found!")
            continue

        file_size_mb = os.path.getsize(ds["zip"]) / (1024 * 1024)
        log(f"Archive Size: {file_size_mb:.2f} MB")

        with zipfile.ZipFile(ds["zip"], "r") as zf:
            namelist = zf.namelist()
            all_files = [n for n in namelist if not n.endswith("/")]

            # 1. Image & label enumeration
            img_exts = (".jpg", ".jpeg", ".png", ".bmp")
            images = [n for n in all_files if n.lower().endswith(img_exts)]
            labels = [n for n in all_files if n.lower().endswith(".txt") and not n.lower().endswith("readme.txt") and not n.lower().endswith("readme.dataset.txt") and not n.lower().endswith("readme.roboflow.txt")]

            log(f"Total Image Files: {len(images)}")
            log(f"Total Label Files: {len(labels)}")

            # Check split structure
            splits = defaultdict(list)
            for img in images:
                lower = img.lower()
                if "train" in lower:
                    splits["train"].append(img)
                elif "val" in lower or "valid" in lower:
                    splits["validation"].append(img)
                elif "test" in lower:
                    splits["test"].append(img)
                elif "human detection dataset/0/" in lower or "human detection dataset\\0\\" in lower:
                    splits["class_0_no_human"].append(img)
                elif "human detection dataset/1/" in lower or "human detection dataset\\1\\" in lower:
                    splits["class_1_human"].append(img)
                else:
                    splits["unassigned"].append(img)

            split_summary = {k: len(v) for k, v in splits.items()}
            log(f"Data Splits: {split_summary}")
            stats_for_chart[ds["name"]] = split_summary

            # Check Readmes / License
            readmes = [n for n in all_files if "readme" in n.lower() or "data.yaml" in n.lower()]
            log(f"Metadata files detected: {readmes}")
            for r in readmes:
                try:
                    content = zf.read(r).decode("utf-8", errors="ignore")[:300]
                    first_lines = " | ".join(content.splitlines()[:3])
                    log(f"  [{r}]: {first_lines}")
                except Exception as e:
                    pass

            # 2. Image verification, dimension sampling, MD5 duplicate check
            image_dimensions = []
            image_modes = Counter()
            corrupted_images = []
            md5_map = defaultdict(list)

            # Sample up to 3000 images for fast check
            sample_imgs = images[:3000] if len(images) > 3000 else images
            for img_name in sample_imgs:
                try:
                    img_bytes = zf.read(img_name)
                    # MD5 check
                    h = hashlib.md5(img_bytes).hexdigest()
                    md5_map[h].append(img_name)

                    with Image.open(io.BytesIO(img_bytes)) as im:
                        image_dimensions.append(im.size)
                        image_modes[im.mode] += 1
                except Exception as err:
                    corrupted_images.append((img_name, str(err)))

            log(f"Sampled Images Checked for Integrity: {len(sample_imgs)}")
            log(f"Corrupted Images: {len(corrupted_images)}")
            if corrupted_images:
                log(f"  First 5 corrupted: {corrupted_images[:5]}")

            log(f"Color Modes: {dict(image_modes)}")
            if image_dimensions:
                widths, heights = zip(*image_dimensions)
                log(f"Image Resolution Stats: Min ({min(widths)}x{min(heights)}), Max ({max(widths)}x{max(heights)}), Mean ({sum(widths)//len(widths)}x{sum(heights)//len(heights)})")

            # Duplicate check
            duplicates = {k: v for k, v in md5_map.items() if len(v) > 1}
            log(f"Duplicate Image Sets Detected: {len(duplicates)}")
            if duplicates:
                duplicate_lines.append(f"=== Duplicates in {ds['name']} ===")
                for h, flist in list(duplicates.items())[:20]:
                    duplicate_lines.append(f"MD5 {h} ({len(flist)} copies): {flist[:4]}")

            # 3. Label inspection & validation
            class_counter = Counter()
            invalid_boxes = 0
            total_boxes = 0
            empty_label_files = 0
            missing_labels = 0

            # Match images to labels
            img_base_map = {os.path.splitext(os.path.basename(im))[0]: im for im in images}
            lbl_base_map = {os.path.splitext(os.path.basename(lb))[0]: lb for lb in labels}

            for im_base in img_base_map:
                if im_base not in lbl_base_map:
                    missing_labels += 1

            for lbl_name in labels:
                try:
                    raw = zf.read(lbl_name).decode("utf-8", errors="ignore").strip()
                    if not raw:
                        empty_label_files += 1
                        continue
                    for line in raw.splitlines():
                        parts = line.strip().split()
                        if len(parts) >= 5:
                            cls_id = parts[0]
                            class_counter[cls_id] += 1
                            total_boxes += 1
                            x, y, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
                            if not (0.0 <= x <= 1.0 and 0.0 <= y <= 1.0 and 0.0 < w <= 1.0 and 0.0 < h <= 1.0):
                                invalid_boxes += 1
                except Exception as err:
                    invalid_boxes += 1

            log(f"Total Bounding Boxes: {total_boxes}")
            log(f"Classes Found: {dict(class_counter)}")
            log(f"Empty Label Files (Background samples): {empty_label_files}")
            log(f"Images Missing Matching Label: {missing_labels}")
            log(f"Out-of-Bounds/Invalid Bounding Boxes: {invalid_boxes}")

            # 4. Generate Visualized Sample Labels
            if labels and images:
                drawn_samples = 0
                for lbl_name in labels:
                    lbl_base = os.path.splitext(os.path.basename(lbl_name))[0]
                    if lbl_base in img_base_map:
                        img_path = img_base_map[lbl_base]
                        try:
                            img_data = zf.read(img_path)
                            im = Image.open(io.BytesIO(img_data)).convert("RGB")
                            draw = ImageDraw.Draw(im)
                            w_img, h_img = im.size

                            lbl_data = zf.read(lbl_name).decode("utf-8", errors="ignore").strip()
                            for line in lbl_data.splitlines():
                                p = line.strip().split()
                                if len(p) >= 5:
                                    cls_id = p[0]
                                    xc, yc, bw, bh = float(p[1]), float(p[2]), float(p[3]), float(p[4])
                                    x1 = (xc - bw / 2) * w_img
                                    y1 = (yc - bh / 2) * h_img
                                    x2 = (xc + bw / 2) * w_img
                                    y2 = (yc + bh / 2) * h_img
                                    draw.rectangle([x1, y1, x2, y2], outline="#10B981", width=3)
                                    draw.text((x1, max(0, y1 - 12)), f"person {cls_id}", fill="#10B981")

                            out_name = f"{ds['id']}_sample_{drawn_samples + 1}.jpg"
                            im.save(os.path.join(sample_labels_dir, out_name), quality=90)
                            drawn_samples += 1
                            if drawn_samples >= 3:
                                break
                        except Exception as err:
                            pass

        log("\n")

    # Write Validation Report
    val_report_path = os.path.join(audit_dir, "validation_report.txt")
    with open(val_report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
    print(f"Validation report saved to: {val_report_path}")

    # Write Duplicate Report
    dup_report_path = os.path.join(audit_dir, "duplicate_report.txt")
    with open(dup_report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(duplicate_lines) if duplicate_lines else "No duplicate sets detected.")
    print(f"Duplicate report saved to: {dup_report_path}")

    # Generate Chart
    plt.figure(figsize=(10, 6))
    ds_names = list(stats_for_chart.keys())
    split_keys = ["train", "validation", "test", "class_0_no_human", "class_1_human"]

    colors = ['#10B981', '#3B82F6', '#F59E0B', '#64748B', '#8B5CF6']
    bottoms = [0] * len(ds_names)

    for i, sk in enumerate(split_keys):
        counts = [stats_for_chart.get(ds, {}).get(sk, 0) for ds in ds_names]
        if any(counts):
            plt.bar(ds_names, counts, bottom=bottoms, label=sk, color=colors[i % len(colors)], width=0.55)
            bottoms = [b + c for b, c in zip(bottoms, counts)]

    plt.title("DivYatra Dataset Audit: Image & Split Distribution", fontsize=13, fontweight='bold')
    plt.ylabel("Number of Images", fontsize=11)
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    plt.legend(title="Data Partition / Class")
    plt.tight_layout()

    chart_path = os.path.join(audit_dir, "class_distribution.png")
    plt.savefig(chart_path, dpi=150)
    plt.close()
    print(f"Class distribution chart saved to: {chart_path}")

if __name__ == "__main__":
    audit_datasets()
