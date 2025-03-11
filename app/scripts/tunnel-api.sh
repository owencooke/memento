#!/bin/bash
#
# --------------------------------------------------------------------------------
# This script was written using Generative AI on March 7, 2025.
#
# LLM Model: Claude 3.7 Sonnet
# 
# Prompt:
#
# write a bash script that does the following:
# 
# 1. runs command " lt --port 8000" to launch a local tunnel instance
# 2. gets the url for the local tunnel returned by the local tunnel call 
# 3. overwrites the /app/.env file with the local tunnel url (a new env property called EXPO_PUBLIC_TUNNEL_API_HOST)
# 4. waits until user cancels via ctrl c
# 5. shuts down the local tunnel
# 6. removes the EXPO_PUBLIC_TUNNEL_API_HOST variable from the .env file
# --------------------------------------------------------------------------------

# Check if localtunnel is installed
if ! command -v lt &> /dev/null; then
    echo "Error: localtunnel is not installed. Please install using 'npm install -g localtunnel'"
    exit 1
fi

ENV_FILE=".env"

# Make sure the .env file exists
touch "$ENV_FILE"

# Function to clean up before exit
cleanup() {
    echo -e "\nShutting down tunnel..."
    # Kill the lt process
    kill $LT_PID
    # Remove the EXPO_PUBLIC_TUNNEL_API_HOST from .env
    grep -v "EXPO_PUBLIC_TUNNEL_API_HOST" "$ENV_FILE" > "$ENV_FILE.tmp"
    mv "$ENV_FILE.tmp" "$ENV_FILE"
    echo "EXPO_PUBLIC_TUNNEL_API_HOST removed from .env file"
    exit 0
}

# Set up trap for Ctrl+C
trap cleanup SIGINT SIGTERM

echo "Starting local tunnel on port 8000..."

# Start lt and capture its output
npx localtunnel --port 8000 > >(
    # Process the output to find the URL
    while read line; do
        echo "$line"
        if [[ $line == *"your url is:"* ]]; then
            # Extract the URL
            TUNNEL_URL=$(echo "$line" | grep -o 'https://[^ ]*')
            
            # Remove https:// prefix for the environment variable
            TUNNEL_HOST=${TUNNEL_URL#https://}
            
            # Create backup of .env file
            cp "$ENV_FILE" "$ENV_FILE.bak"
            
            # Remove any existing EXPO_PUBLIC_TUNNEL_API_HOST line
            grep -v "EXPO_PUBLIC_TUNNEL_API_HOST" "$ENV_FILE" > "$ENV_FILE.tmp"
            
            # Add the new tunnel URL to .env
            echo "EXPO_PUBLIC_TUNNEL_API_HOST=$TUNNEL_HOST" >> "$ENV_FILE.tmp"
            mv "$ENV_FILE.tmp" "$ENV_FILE"
            
            echo "Added EXPO_PUBLIC_TUNNEL_API_HOST=$TUNNEL_HOST to .env file"
            echo "Press Ctrl+C to stop the tunnel and clean up"
        fi
    done
) 2>&1 &

LT_PID=$!

# Wait for the lt process to finish (which will only happen if it's killed)
wait $LT_PID
