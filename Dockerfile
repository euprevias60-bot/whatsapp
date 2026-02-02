FROM node:20-slim

# Install system dependencies for Puppeteer/Chrome
# This list includes necessary libraries for running headless Chrome
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set up storage directory for db
RUN mkdir -p /app/data

# Create app directory
WORKDIR /app

# Copy package files first
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
WORKDIR /app/client
RUN npm install
WORKDIR /app/server
RUN npm install

# Copy source
WORKDIR /app
COPY . .

# Build Frontend
WORKDIR /app/client
RUN npm run build

# Setup Backend Environment
WORKDIR /app/server
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Expose port
EXPOSE 3001

# Start command
CMD ["node", "index.js"]
