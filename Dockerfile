FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

##########################################

FROM golang:1.23-alpine AS backend-builder

WORKDIR /app

RUN apk update && apk add --no-cache build-base sqlite
COPY go.mod go.sum ./
RUN go mod download

COPY . ./
COPY --from=frontend-builder /app/static/style.css ./static/style.css
RUN CGO_ENABLED=1 GOOS=linux go build -o feedaka main.go

##########################################

FROM alpine

WORKDIR /app
COPY --from=backend-builder /app/feedaka /app

EXPOSE 8080
CMD ["/app/feedaka"]
