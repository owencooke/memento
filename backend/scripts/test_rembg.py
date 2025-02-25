from rembg import remove
from PIL import Image
import sys


def remove_background(input_path: str, output_path: str):
    try:
        # Open input image
        input_image = Image.open(input_path)

        # Remove background
        output_image = remove(input_image)

        # Convert to RGBA to handle transparency
        output_image = output_image.convert("RGBA")

        # Get bounding box of non-transparent area
        bbox = output_image.getbbox()
        if bbox:
            output_image = output_image.crop(bbox)

        # Save output image
        output_image.save(output_path, format="PNG")
        print(f"Background removed and saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <input_image> <output_image>")
    else:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        remove_background(input_path, output_path)
