import shutil
import subprocess
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file


def start():
    python_path = shutil.which("python")
    subprocess.run([python_path, "-m", "server"])


def lint():
    subprocess.run(["pre-commit", "run", "-a"])


def test():
    subprocess.run(["pytest", "-vv"])


def sync_db_pydantic():
    db_url = os.getenv("DB_URL")
    if not db_url:
        raise ValueError("DB_URL environment variable not set")

    output_dir = "server/services/db/models"
    lib_dir = os.path.join(output_dir, "fastapi")

    subprocess.run(
        [
            "sb-pydantic",
            "gen",
            "--type",
            "pydantic",
            "--framework",
            "fastapi",
            "--db-url",
            db_url,
            "--schema",
            "public",
            # "--schema",
            # "auth",
            "--dir",
            output_dir,
        ]
    )

    # Adjust final generated location
    if os.path.exists(lib_dir):
        for filename in os.listdir(lib_dir):
            dest_path = os.path.join(output_dir, filename)
            if os.path.exists(dest_path):
                os.remove(dest_path)
            shutil.move(os.path.join(lib_dir, filename), dest_path)
        os.rmdir(lib_dir)
