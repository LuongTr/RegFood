import os
import shutil
import sys
from pathlib import Path

def create_dataset_structure(base_dir):
    """Create the basic dataset structure for food classes"""
    dataset_dir = os.path.join(base_dir, 'dataset')
    
    # Create dataset directory if it doesn't exist
    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir)
        print(f"Created dataset directory at {dataset_dir}")
    
    # Create sample food class directories
    sample_classes = [
        'apple_pie', 'pizza', 'hamburger', 'sushi', 'fried_rice',
        'chicken_curry', 'salad', 'ice_cream', 'pasta', 'sandwich'
    ]
    
    for food_class in sample_classes:
        class_dir = os.path.join(dataset_dir, food_class)
        if not os.path.exists(class_dir):
            os.makedirs(class_dir)
            print(f"Created class directory: {food_class}")
    
    print(f"\nDataset structure created at {dataset_dir}")
    print("Next steps:")
    print("1. Add at least 20-30 images to each food class folder")
    print("2. Make sure images are in jpg or png format")
    print("3. Run 'python check_dataset.py' to verify your dataset")
    print("4. Start the app.py server to train the model")

def clean_dataset():
    """Remove empty class directories from the dataset"""
    dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')
    
    if not os.path.exists(dataset_dir):
        print(f"Dataset directory not found at {dataset_dir}")
        return
    
    removed = 0
    for class_name in os.listdir(dataset_dir):
        class_dir = os.path.join(dataset_dir, class_name)
        
        if os.path.isdir(class_dir):
            # Count images in this directory
            image_count = len([f for f in os.listdir(class_dir) 
                              if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp'))])
            
            if image_count == 0:
                shutil.rmtree(class_dir)
                print(f"Removed empty class directory: {class_name}")
                removed += 1
    
    print(f"Removed {removed} empty class directories")

def show_usage():
    """Show the usage information for this script"""
    print("Usage:")
    print("  python manage_dataset.py create   - Create initial dataset structure")
    print("  python manage_dataset.py clean    - Remove empty class directories")
    print("  python manage_dataset.py help     - Show this help message")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    if len(sys.argv) < 2:
        show_usage()
        sys.exit(0)
    
    command = sys.argv[1].lower()
    
    if command == 'create':
        create_dataset_structure(script_dir)
    elif command == 'clean':
        clean_dataset()
    elif command == 'help':
        show_usage()
    else:
        print(f"Unknown command: {command}")
        show_usage()
        sys.exit(1)