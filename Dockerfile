# ---------- FRONTEND BUILD ----------
FROM node:20 AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend .

RUN npm run build


# ---------- BACKEND ----------
FROM node:20

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend .

# copy frontend build into backend public folder
COPY --from=frontend /app/frontend/dist ./public

EXPOSE 5003

CMD ["npm", "start"]