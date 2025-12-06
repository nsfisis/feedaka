FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ ./
COPY graphql/schema.graphql src/graphql/schema.graphql
RUN npm run build

##########################################
FROM golang:1.24 AS backend-builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y libsqlite3-dev

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
COPY --from=frontend-builder /app/dist/ ./public/
RUN CGO_ENABLED=1 GOOS=linux go build -o feedaka .

##########################################
FROM gcr.io/distroless/cc-debian12

WORKDIR /app
COPY --from=backend-builder /app/feedaka /app

EXPOSE 8080
CMD ["/app/feedaka"]
