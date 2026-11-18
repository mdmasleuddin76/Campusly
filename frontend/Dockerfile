# Stage 1: build the React app
# Debian-based Node for the build: Vite's bundler (Rollup) can crash on Alpine with
# "Code is nested too deeply" because of Alpine's small thread stack. The final image is still tiny.
FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Empty = the app calls /api on the same domain (Nginx below forwards it to the backend)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: serve the built files with Nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
