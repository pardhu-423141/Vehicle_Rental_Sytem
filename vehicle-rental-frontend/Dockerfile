FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the Vite port
EXPOSE 5173

# Start Vite in host mode so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]