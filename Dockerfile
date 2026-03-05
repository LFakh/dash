# Stage 1: Build the Full-stack dashboard
FROM docker.io/library/node:22-alpine AS build

WORKDIR /app

# Copy and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy app source code and build
COPY . .
RUN npm run build

# Stage 2: Create production image
FROM docker.io/library/node:22-alpine AS production

WORKDIR /app

# Copy production dependencies from build stage
COPY --from=build /app/node_modules ./node_modules
# Copy SvelteKit build output
COPY --from=build /app/build ./build
# Set a non-root user to run the app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port the app will run on
EXPOSE 3000

# The command to start the Node.js server
# SvelteKit with adapter-node outputs a server to the 'build' directory.
CMD ["node", "build/index.js"]
