import os
import logging
import json
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def train_and_save_model(dataset_dir, epochs=1, batch_size=32):
    """Train the food recognition model and save it to disk"""
    try:
        # Output directories and files
        model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'food_model')
        model_file = os.path.join(model_dir, 'food_model.keras')  # Use .keras extension
        mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'class_mapping.json')
        
        logger.info(f"Starting model training from dataset directory: {dataset_dir}")
        logger.info(f"This will train for {epochs} epoch(s)")
        
        # Image dimensions - MobileNet works best with 224x224
        img_height, img_width = 224, 224
        
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            validation_split=0.2  # Use 20% of data for validation
        )
        
        # Create training dataset
        train_generator = train_datagen.flow_from_directory(
            dataset_dir,
            target_size=(img_height, img_width),
            batch_size=batch_size,
            class_mode='sparse',
            subset='training'
        )
        
        # Create validation dataset
        validation_generator = train_datagen.flow_from_directory(
            dataset_dir,
            target_size=(img_height, img_width),
            batch_size=batch_size,
            class_mode='sparse',
            subset='validation'
        )
        
        # Store class mapping
        class_mapping = {v: k for k, v in train_generator.class_indices.items()}
        
        # Save the class mapping to a JSON file
        with open(mapping_file, 'w') as f:
            json.dump(class_mapping, f)
        
        logger.info(f"Found {len(class_mapping)} classes in dataset")
        for idx, class_name in class_mapping.items():
            logger.info(f"  Class {idx}: {class_name}")
        
        # Build the model with an efficient architecture (for faster training)
        base_model = tf.keras.applications.MobileNetV3Small(
            include_top=False,
            weights='imagenet',
            input_shape=(img_height, img_width, 3),
            pooling='avg'
        )
        
        # Freeze the base model layers
        base_model.trainable = False
        
        # Build full model with classification head
        inputs = tf.keras.Input(shape=(img_height, img_width, 3))
        x = tf.keras.applications.mobilenet_v3.preprocess_input(inputs)
        x = base_model(x, training=False)
        x = tf.keras.layers.Dropout(0.2)(x)
        outputs = tf.keras.layers.Dense(len(class_mapping), activation='softmax')(x)
        
        model = tf.keras.Model(inputs=inputs, outputs=outputs)
        
        # Compile the model
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=['accuracy']
        )
        
        # Show model summary
        model.summary()
        
        logger.info(f"Starting model training for {epochs} epoch(s)...")
        logger.info(f"This may take some time depending on the size of your dataset.")
        
        # Train for the specified number of epochs
        history = model.fit(
            train_generator,
            epochs=epochs,
            validation_data=validation_generator,
            verbose=1
        )
        
        # Save the model
        if not os.path.exists(model_dir):
            os.makedirs(model_dir)
        
        # Save with proper .keras extension
        model.save(model_file)
        logger.info(f"Model trained and saved to {model_file}")
        
        # Plot training metrics and save the plot
        plt.figure(figsize=(12, 4))
        
        plt.subplot(1, 2, 1)
        plt.plot(history.history['accuracy'])
        plt.plot(history.history['val_accuracy'])
        plt.title('Model Accuracy')
        plt.ylabel('Accuracy')
        plt.xlabel('Epoch')
        plt.legend(['Train', 'Validation'], loc='upper left')
        
        plt.subplot(1, 2, 2)
        plt.plot(history.history['loss'])
        plt.plot(history.history['val_loss'])
        plt.title('Model Loss')
        plt.ylabel('Loss')
        plt.xlabel('Epoch')
        plt.legend(['Train', 'Validation'], loc='upper left')
        
        plt.tight_layout()
        metrics_file = os.path.join(model_dir, 'training_metrics.png')
        plt.savefig(metrics_file)
        
        logger.info(f"Training metrics saved as {metrics_file}")
        
        # Print final metrics
        logger.info(f"Final training accuracy: {history.history['accuracy'][-1]:.4f}")
        logger.info(f"Final validation accuracy: {history.history['val_accuracy'][-1]:.4f}")
        logger.info("Model training complete!")
        return True
        
    except Exception as e:
        logger.error(f"Error in model training: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train a food recognition model')
    parser.add_argument('--epochs', type=int, default=1, help='Number of epochs to train (default: 1)')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size for training (default: 32)')
    parser.add_argument('--dataset', type=str, default=None, help='Path to dataset directory')
    
    args = parser.parse_args()
    
    # Use provided dataset path or default to 'dataset' in the current directory
    dataset_path = args.dataset if args.dataset else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')
    
    if not os.path.exists(dataset_path):
        logger.error(f"Dataset directory does not exist: {dataset_path}")
        print("Please create a dataset directory with food classes or specify a valid path with --dataset")
        exit(1)
    
    print(f"Starting training with {args.epochs} epoch(s)...")
    result = train_and_save_model(dataset_path, epochs=args.epochs, batch_size=args.batch_size)
    
    if result:
        print("Training completed successfully! You can now use the app.py to recognize foods.")
    else:
        print("Training failed. Check the error logs.")