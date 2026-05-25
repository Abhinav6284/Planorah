# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy all files first (including scripts needed for postinstall)
COPY . .

# Install dependencies
RUN npm ci

# Build the application
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Runtime stage - serve with Node static server
FROM node:20-alpine

WORKDIR /app

# Install serve to serve the static build
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/build ./build

# Copy public assets
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Development command (use serve for production)
# Override with npm start for development
CMD ["serve", "-s", "build", "-l", "3000"]
