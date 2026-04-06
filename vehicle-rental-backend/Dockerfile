# Use Node.js 20 (Alpine is a lightweight version)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (better for caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Generate Prisma client (if you are using Prisma)
RUN npx prisma generate

# The port your backend listens on
EXPOSE 5000

# Command to run the app
CMD ["npm", "run", "dev"]