# Use Node.js as the base image
FROM node:20-slim

# Install Python and system dependencies for EasyOCR/OpenCV
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create a virtual environment for Python
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy Python requirements and install
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy package.json and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the server code
COPY . .

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
