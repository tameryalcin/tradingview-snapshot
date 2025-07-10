FROM node:18-alpine

# Install Chrome dependencies and cron
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dcron

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application files
COPY . .

# Create screenshots directory
RUN mkdir -p /app/screenshots

# Copy and setup cron job
COPY crontab /tmp/crontab
RUN crontab /tmp/crontab

# Create log directory for cron
RUN mkdir -p /var/log && touch /var/log/cleanup.log

# Make cleanup script executable
RUN chmod +x /app/cleanup.js

# Expose port
EXPOSE 3000

# Start both cron and the application
CMD ["sh", "-c", "crond -f -d 8 & npm start"]