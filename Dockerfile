# Use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lockb /temp/
RUN cd /temp && bun install --frozen-lockfile --production

# Copy the entire project
COPY . .

# Build the application (client + server)
RUN bun run build

# Expose the port the app runs on (adjust if different)
EXPOSE 3000

# Start the app in production mode
CMD ["bun", "src/index.tsx"]
