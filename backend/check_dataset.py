import os
import sys
from pathlib import Path

def check_dataset(dataset_path):
    """Check if the dataset is structured correctly"""
    print(f"Checking dataset at {dataset_path}")
    
    if not os.path.exists(dataset_path):
        print(f"❌ Error: Dataset directory not found at {dataset_path}")
        return False
    
    class_folders = [f for f in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, f))]
    
    if len(class_folders) == 0:
        print("❌ Error: No class folders found in dataset directory")
        return False
    
    print(f"✅ Found {len(class_folders)} class folders")
    
    # Check each class folder
    for class_folder in class_folders:
        class_path = os.path.join(dataset_path, class_folder)
        images = [f for f in os.listdir(class_path) 
                 if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]
        
        if len(images) == 0:
            print(f"⚠️ Warning: No images found in class folder: {class_folder}")
        else:
            print(f"✅ Found {len(images)} images in class folder: {class_folder}")
    
    print("Dataset check complete.")
    return True

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, 'dataset')
    check_dataset(dataset_path)