FROM node:alpine

# Set build arguments
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG ANALYTICS_ID
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG FTP_HOST
ARG FTP_PORT
ARG FTP_USER
ARG FTP_PASSWORD

# Set environment variables
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV ANALYTICS_ID=$ANALYTICS_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV FTP_HOST=$FTP_HOST
ENV FTP_PORT=$FTP_PORT
ENV FTP_USER=$FTP_USER
ENV FTP_PASSWORD=$FTP_PASSWORD

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --only=production
RUN npm i -D @sveltejs/adapter-node

# Copy the rest of the application code
COPY . .

# Replace adapter-auto with adapter-node in svelte.config.js
RUN sed -i 's/adapter-auto/adapter-node/g' /app/svelte.config.js

# Build the application
RUN npm run build

# Set runtime environment variables
ENV PORT=8080
ENV HOST=0.0.0.0

# Start the application
CMD ["node", "build/index.js"]