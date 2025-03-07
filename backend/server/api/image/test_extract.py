import requests
import base64

# Read and encode the image
with open("./test.png", "rb") as image_file:
    base64_string = base64.b64encode(image_file.read()).decode("utf-8")

# API URL (Adjust the URL if running locally)
url = "http://127.0.0.1:8000/api/img/extract_text/"

# Send request
response = requests.post(url, json={"image_base64": base64_string})

# Print response
print(response.json())
