# Use an official Node.js image as the base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install project dependencies
RUN npm ci --omit=dev

# Copy the rest of the application source code
COPY . .

# Tell Docker that the application listens on port 3009
EXPOSE 3009

# Start the application
CMD ["npm", "start"]