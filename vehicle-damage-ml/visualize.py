import cv2
import os
import random
import yaml # You may need to run: pip install pyyaml

# --- CONFIGURATION: Update these paths if your folders are named differently ---
IMAGE_DIR = 'car-dataset/train/images'
LABEL_DIR = 'car-dataset/train/labels'
DATA_YAML = 'car-dataset/data.yaml'
# --------------------------------------------------------------------------

def main():
    """Picks a random image and displays it with its bounding boxes."""
    # 1. Get the list of class names from the data.yaml file
    with open(DATA_YAML, 'r') as f:
        data_config = yaml.safe_load(f)
        class_names = data_config['names']

    # 2. Pick a random image file
    image_files = os.listdir(IMAGE_DIR)
    random_image_name = random.choice(image_files)
    image_path = os.path.join(IMAGE_DIR, random_image_name)

    # 3. Determine the corresponding label file path
    label_name = os.path.splitext(random_image_name)[0] + '.txt'
    label_path = os.path.join(LABEL_DIR, label_name)

    # 4. Load the image
    image = cv2.imread(image_path)
    h, w, _ = image.shape

    # 5. Read the label file and draw the boxes
    if not os.path.exists(label_path):
        print(f"No label file found for {random_image_name}")
        return

    with open(label_path, 'r') as f:
        for line in f:
            # YOLO format: class_id x_center y_center width height
            parts = line.strip().split()
            class_id = int(parts[0])
            x_center, y_center = float(parts[1]) * w, float(parts[2]) * h
            box_width, box_height = float(parts[3]) * w, float(parts[4]) * h

            # Calculate corner coordinates
            x1 = int(x_center - box_width / 2)
            y1 = int(y_center - box_height / 2)
            x2 = int(x_center + box_width / 2)
            y2 = int(y_center + box_height / 2)

            # Draw the rectangle and the label text
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            label_text = class_names[class_id]
            cv2.putText(image, label_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    # 6. Show the image in a new window
    cv2.imshow('Damage Detection Visualization', image)
    print(f"Displaying image: {random_image_name}. Press any key to close.")
    cv2.waitKey(0) # Wait until a key is pressed
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()