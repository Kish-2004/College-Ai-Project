# === STAGE 1: Build the React App ===
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the static files
RUN npm run build

# === STAGE 2: Serve with Nginx ===
FROM nginx:1.27-alpine

# Copy the static files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80