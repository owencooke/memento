from PIL import Image


async def create_collage(
    images: list[Image.Image], grid_size=(3, 3), image_size=(200, 200)
) -> Image.Image:
    """Create a collage from images."""
    rows, cols = grid_size
    collage_width = cols * image_size[0]
    collage_height = rows * image_size[1]

    collage = Image.new("RGB", (collage_width, collage_height), "white")

    for idx, image in enumerate(images[: rows * cols]):  # Limit to grid size
        resized_img = image.resize(image_size)
        x_offset = (idx % cols) * image_size[0]
        y_offset = (idx // cols) * image_size[1]
        collage.paste(resized_img, (x_offset, y_offset))

    return collage
