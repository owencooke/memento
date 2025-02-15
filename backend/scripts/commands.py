import subprocess


def start():
    subprocess.run(["python", "-m", "server"])


def lint():
    subprocess.run(["pre-commit", "run", "-a"])


def test():
    subprocess.run(["pytest", "-vv"])
