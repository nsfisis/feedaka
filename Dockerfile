FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

##########################################

FROM golang:1.23-alpine AS backend-builder

WORKDIR /app

RUN apk update && apk add --no-cache build-base sqlite
COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
COPY --from=frontend-builder /app/dist/style.css ./static/style.css
RUN CGO_ENABLED=1 GOOS=linux go build -o feedaka main.go

##########################################

FROM alpine

WORKDIR /app
COPY --from=backend-builder /app/feedaka /app

EXPOSE 8080
CMD ["/app/feedaka"]
