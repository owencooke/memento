import cv2
import numpy as np
from PIL import Image
from tensorflow.keras.applications.resnet50 import (  # type: ignore
    ResNet50,  # type: ignore
    decode_predictions,
    preprocess_input,
)
from tensorflow.keras.preprocessing import image  # type: ignore

# Load the pre-trained ResNet50 model
model = ResNet50(weights="imagenet")


# Function to process PIL.Image
def predict_class(pil_img: Image.Image) -> str:
    """Classify an image using a classification model"""
    # Convert PIL image to OpenCV format (BGR)
    img = np.array(pil_img)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # Get original dimensions
    h, w, _ = img.shape

    # Compute new dimensions while maintaining aspect ratio
    scale = 224 / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)

    # Resize the image while maintaining aspect ratio
    resized = cv2.resize(img, (new_w, new_h))

    # Create a black canvas (padded image) of size 224x224
    padded = np.zeros((224, 224, 3), dtype=np.uint8)

    # Compute center offset
    x_offset = (224 - new_w) // 2
    y_offset = (224 - new_h) // 2

    # Place the resized image on the center of the padded canvas
    padded[y_offset : y_offset + new_h, x_offset : x_offset + new_w] = resized

    # Convert to array format for Keras
    x = image.img_to_array(padded)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)

    preds = model.predict(x)

    return decode_predictions(preds, top=1)[0][0][1]  # Best prediction
