import os
import random
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter
from loguru import logger
from server.config.settings import ROOT_DIR
from server.services.db.models.schema_public_latest import Collection


def load_font(font_name: str, size: int):
    """Attempts to load a font; falls back to default with detailed logging."""
    font_path = os.path.join(ROOT_DIR, "assets/fonts", font_name)
    logger.info(f"Attempting to load font: {font_name} from {font_path}")

    try:
        if os.path.exists(font_path):
            font = ImageFont.truetype(font_path, size)
            logger.info(f"Successfully loaded font: {font_name} at size {size}")
            return font
        else:
            logger.warning(
                f"Font file not found at {font_path}, falling back to default"
            )
            default_font = ImageFont.load_default()
            return default_font
    except Exception as e:
        logger.error(f"Error loading font {font_name}: {str(e)}")
        return ImageFont.load_default()


async def create_collage(
    collection: Collection,
    images: list[Image.Image],
    canvas_size=(1000, 800),  # Larger fixed canvas for collage
    min_image_size=(150, 150),
    max_image_size=(300, 300),
    margin=20,
    title_height=80,
    corner_radius=10,
) -> Image.Image:
    """Creates an artistic collage with scattered/rotated/overlapping images and proper text."""
    logger.info(f"Creating collage for collection: {collection.title}")
    logger.info(f"Collection details: {collection.__dict__}")
    logger.info(f"Number of images: {len(images)}")

    # Create canvas with fixed dimensions
    collage_width, collage_height = canvas_size

    # Calculate areas
    text_area_height = title_height + margin
    images_area_height = collage_height - text_area_height - (margin * 3)

    if collection.caption:
        caption_height = 60
        images_area_height -= caption_height + margin
    else:
        caption_height = 0

    # Create blank white collage
    collage = Image.new("RGB", (collage_width, collage_height), (255, 255, 255))
    draw = ImageDraw.Draw(collage)

    # Load fonts with extensive logging
    logger.info("Loading fonts...")
    title_font = load_font("Pacifico-Regular.ttf", 40)
    caption_font = load_font("Quicksand-Regular.ttf", 24)
    metadata_font = load_font("Quicksand-Regular.ttf", 18)

    # Get actual font sizes using getbbox for better positioning
    logger.info("Calculating text dimensions...")
    title_bbox = draw.textbbox((0, 0), collection.title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_height = title_bbox[3] - title_bbox[1]

    # Center title horizontally
    title_x = (collage_width - title_width) // 2
    title_y = margin

    # Draw title
    logger.info(f"Drawing title at position ({title_x}, {title_y})")
    draw.text((title_x, title_y), collection.title, fill=(50, 50, 50), font=title_font)

    # Calculate image area boundaries
    image_area_top = title_y + title_height + margin
    image_area_bottom = (
        collage_height - (caption_height + margin * 2)
        if collection.caption
        else collage_height - margin
    )

    # Randomize and place images on canvas
    logger.info("Placing images on canvas with artistic layout...")
    used_areas = []
    max_attempts = 100

    # Limit to a reasonable number of images to avoid excessive overlap
    images_to_use = images[: min(15, len(images))]
    logger.info(f"Using {len(images_to_use)} images for the collage")

    for idx, image in enumerate(images_to_use):
        try:
            # Randomly determine image size within constraints
            img_width = random.randint(min_image_size[0], max_image_size[0])
            img_height = random.randint(min_image_size[1], max_image_size[1])

            # Resize the image
            resized_img = ImageOps.fit(
                image, (img_width, img_height), Image.Resampling.LANCZOS
            )
            logger.info(f"Resized image {idx} to ({img_width}, {img_height})")

            # Apply rounded corners
            rounded_mask = Image.new("L", (img_width, img_height), 0)
            mask_draw = ImageDraw.Draw(rounded_mask)
            mask_draw.rounded_rectangle(
                (0, 0, img_width, img_height), corner_radius, fill=255
            )

            # Add a slight border/shadow effect
            bordered_img = Image.new("RGBA", (img_width, img_height), (0, 0, 0, 0))
            bordered_img.paste(resized_img, (0, 0), rounded_mask)

            # Apply random rotation (-20 to 20 degrees)
            rotation = random.randint(-20, 20)
            rotated_img = bordered_img.rotate(
                rotation, expand=True, resample=Image.Resampling.BICUBIC
            )

            # Find a suitable position (with some overlap allowed)
            placed = False
            attempts = 0

            while not placed and attempts < max_attempts:
                x_offset = random.randint(margin, collage_width - img_width - margin)
                y_offset = random.randint(
                    image_area_top, image_area_bottom - img_height
                )

                # Check overlap with other images - allow some overlap but not too much
                overlap_too_much = False
                current_rect = (
                    x_offset,
                    y_offset,
                    x_offset + img_width,
                    y_offset + img_height,
                )

                for used_rect in used_areas:
                    # Calculate overlap area
                    overlap_x = max(
                        0,
                        min(current_rect[2], used_rect[2])
                        - max(current_rect[0], used_rect[0]),
                    )
                    overlap_y = max(
                        0,
                        min(current_rect[3], used_rect[3])
                        - max(current_rect[1], used_rect[1]),
                    )
                    overlap_area = overlap_x * overlap_y
                    current_area = img_width * img_height

                    # If overlap is more than 40% of the image area, try another position
                    if overlap_area > (current_area * 0.4):
                        overlap_too_much = True
                        break

                if not overlap_too_much:
                    placed = True
                    used_areas.append(current_rect)

                    # Add a subtle drop shadow
                    shadow_offset = 3
                    shadow = Image.new("RGBA", rotated_img.size, (0, 0, 0, 0))
                    shadow_draw = ImageDraw.Draw(shadow)
                    shadow_draw.rectangle(
                        (
                            shadow_offset,
                            shadow_offset,
                            rotated_img.width,
                            rotated_img.height,
                        ),
                        fill=(20, 20, 20, 100),
                    )
                    shadow = shadow.filter(ImageFilter.GaussianBlur(5))

                    # Paste shadow first, then image
                    collage.paste(shadow, (x_offset, y_offset), shadow)
                    collage.paste(rotated_img, (x_offset, y_offset), rotated_img)

                    logger.info(
                        f"Placed image {idx} at position ({x_offset}, {y_offset}) with rotation {rotation}°"
                    )
                else:
                    attempts += 1

            if not placed:
                logger.warning(
                    f"Could not find suitable position for image {idx} after {max_attempts} attempts"
                )

        except Exception as e:
            logger.error(f"Error processing image {idx}: {str(e)}")
            continue  # Skip problematic images

    # Add caption if available - centered below images
    if collection.caption:
        caption_bbox = draw.textbbox((0, 0), collection.caption, font=caption_font)
        caption_width = caption_bbox[2] - caption_bbox[0]
        caption_x = (collage_width - caption_width) // 2
        caption_y = image_area_bottom + margin

        logger.info(f"Drawing caption at position ({caption_x}, {caption_y})")
        draw.text(
            (caption_x, caption_y),
            collection.caption,
            fill=(50, 50, 50),
            font=caption_font,
        )

    # Add metadata (location & date) at the bottom
    metadata_parts = []
    if collection.location:
        metadata_parts.append(f"📍 {collection.location}")
    if collection.date:
        try:
            date = datetime.fromisoformat(collection.date)
            metadata_parts.append(f"📅 {date.strftime('%B %d, %Y')}")
        except Exception as e:
            logger.warning(f"Error formatting date: {str(e)}")
            metadata_parts.append(f"📅 {collection.date}")

    if metadata_parts:
        metadata_text = " • ".join(metadata_parts)
        metadata_bbox = draw.textbbox((0, 0), metadata_text, font=metadata_font)
        metadata_width = metadata_bbox[2] - metadata_bbox[0]
        metadata_x = (collage_width - metadata_width) // 2
        metadata_y = collage_height - margin - metadata_bbox[3]

        logger.info(f"Drawing metadata at position ({metadata_x}, {metadata_y})")
        draw.text(
            (metadata_x, metadata_y),
            metadata_text,
            fill=(80, 80, 80),
            font=metadata_font,
        )

    logger.info("Collage created successfully")
    return collage
