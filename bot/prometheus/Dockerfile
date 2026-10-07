FROM node:20-alpine

# Install build dependencies for native modules and audio encoding
RUN apk add --no-cache python3 make g++ ffmpeg libsodium-dev

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
