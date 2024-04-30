FROM golang:1.20-alpine as builder

WORKDIR /app

RUN apk update && apk add --no-cache build-base sqlite
COPY go.mod go.sum ./
RUN go mod download

COPY . ./
RUN CGO_ENABLED=1 GOOS=linux go build -o feedaka main.go

FROM alpine

WORKDIR /app
COPY --from=builder /app/feedaka /app

EXPOSE 8080
CMD ["/app/feedaka"]
