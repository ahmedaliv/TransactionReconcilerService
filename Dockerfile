FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY data/ ./data/

# Build the application
RUN npm run build

# Run the application and create output directory in CMD
CMD ["npm", "start"]