import os
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageOps
from server.config.settings import ROOT_DIR
from server.services.db.models.schema_public_latest import Collection


def load_font(font_name: str, size: int):
    """Attempts to load a font; falls back to default."""
    font_path = os.path.join(ROOT_DIR, "/assets/fonts", font_name)
    try:
        return (
            ImageFont.truetype(font_path, size)
            if os.path.exists(font_path)
            else ImageFont.load_default()
        )
    except Exception:
        return ImageFont.load_default()


async def create_collage(
    collection: Collection,
    images: list[Image.Image],
    grid_size=(3, 3),
    image_size=(200, 200),
    margin=20,
    title_height=80,
    caption_height=60,
    corner_radius=10,
) -> Image.Image:
    """Creates a collage from images with title, caption, location, and date."""

    rows, cols = grid_size
    collage_width = cols * image_size[0]
    images_height = rows * image_size[1]
    footer_height = caption_height if collection.caption else 0
    total_height = title_height + images_height + footer_height + (margin * 3)

    # Create blank white collage
    collage = Image.new("RGB", (collage_width, total_height), (255, 255, 255))
    draw = ImageDraw.Draw(collage)

    # Load fonts
    title_font = load_font("Pacifico-Regular.ttf", 40)
    caption_font = load_font("Quicksand-Regular.ttf", 24)
    metadata_font = load_font("Quicksand-Regular.ttf", 18)

    # Draw title with shadow
    draw.text((margin, margin), collection.title, fill=(50, 50, 50), font=title_font)

    # Add images to the grid with rounded corners
    for idx, image in enumerate(images[: rows * cols]):  # Limit to grid size
        try:
            resized_img = image.resize(image_size)
            rounded_img = ImageOps.fit(resized_img, image_size, centering=(0.5, 0.5))
            rounded_mask = Image.new("L", image_size, 0)
            ImageDraw.Draw(rounded_mask).rounded_rectangle(
                (0, 0, *image_size), corner_radius, fill=255
            )

            x_offset = (idx % cols) * image_size[0]
            y_offset = title_height + (idx // cols) * image_size[1] + margin
            collage.paste(rounded_img, (x_offset, y_offset), rounded_mask)
        except Exception:
            continue  # Skip problematic images

    # Add caption if available
    footer_y = title_height + images_height + margin * 2
    if collection.caption:
        draw.text(
            (margin, footer_y), collection.caption, fill=(50, 50, 50), font=caption_font
        )

    # Add metadata (location & date)
    metadata_parts = []
    if collection.location:
        metadata_parts.append(f"📍 {collection.location}")
    if collection.date:
        try:
            date = datetime.fromisoformat(collection.date)
            metadata_parts.append(f"📅 {date.strftime('%B %d, %Y')}")
        except Exception:
            metadata_parts.append(f"📅 {collection.date}")

    if metadata_parts:
        metadata_text = " • ".join(metadata_parts)
        metadata_width = draw.textlength(metadata_text, font=metadata_font)
        draw.text(
            (collage_width - metadata_width - margin, footer_y + 30),
            metadata_text,
            fill=(80, 80, 80),
            font=metadata_font,
        )

    return collage
