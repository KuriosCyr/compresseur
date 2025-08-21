FROM node:18-alpine

# Install FFmpeg and all dependencies for canvas
RUN apk add --no-cache \
    ffmpeg \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    musl-dev \
    gcc \
    g++ \
    make \
    python3 \
    pkgconfig

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 3333

CMD ["npm", "start"]