# Multi-stage build for React application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output exists
RUN ls -la build/ && echo "Build completed successfully"

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Verify files were copied to nginx
RUN ls -la /usr/share/nginx/html/ && echo "Files copied to nginx successfully"

# Create a simple health check endpoint
RUN echo '#!/bin/sh\nwget --no-verbose --tries=1 --spider http://localhost/ || exit 1' > /health-check.sh && chmod +x /health-check.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD /health-check.sh

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]