#!/bin/bash

# Define the output directory and file
OUTPUT_DIR="../.openapi"
OUTPUT_FILE="$OUTPUT_DIR/openapi.json"

# Create the output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Fetch the OpenAPI JSON from the FastAPI server and save it to the output file
curl -o $OUTPUT_FILE http://localhost:8000/openapi.json

# Check if the curl command was successful
if [ $? -eq 0 ]; then
  echo "OpenAPI JSON saved to $OUTPUT_FILE"
else
  echo "Failed to fetch OpenAPI JSON"
  exit 1
fi