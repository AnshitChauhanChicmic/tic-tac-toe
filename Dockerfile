# Stage 1: Build the React application
FROM node:20-alpine as build-stage

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# to leverage Docker's layer caching.
# This step only runs if these files change.
COPY package*.json ./

# Install dependencies
# Using `npm ci` is recommended for CI/CD as it installs exact versions from package-lock.json
# For development builds, `npm install` might be fine.
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the React app for production
# This command depends on your project's `package.json` scripts.
# For Create React App, it's usually `npm run build`.
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine as production-stage

# Copy the built React app from the build-stage to Nginx's HTML directory
# The `/usr/share/nginx/html` is the default directory Nginx serves from.
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
# We'll create this file in the next step to handle React Router (if you use it)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (default HTTP port)
EXPOSE 80

# The default Nginx CMD will start the server
CMD ["nginx", "-g", "daemon off;"]