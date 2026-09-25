# =========================
# Stage 1: Build Frontend
# =========================
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY Frontend/package*.json ./

RUN npm ci

COPY Frontend/ ./

RUN npm run build


# =========================
# Stage 2: Run Backend
# =========================
FROM node:22-alpine

WORKDIR /app

COPY Backend/package*.json ./Backend/

RUN cd Backend && npm ci --omit=dev && npm cache clean --force && rm -rf /root/.cache

COPY Backend/ ./Backend/

COPY --from=frontend-build /app/frontend/dist ./Frontend/dist

EXPOSE 3000

CMD ["node", "Backend/server.js"]