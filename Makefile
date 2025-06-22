serve: build
	FEEDAKA_BASE_PATH="" FEEDAKA_PORT=8080 ./backend/feedaka

build:
	cd frontend && npm run check
	cd frontend && npm run build
	cd backend && go build -o feedaka main.go

fmt:
	cd frontend && npm run fmt
	cd backend && go fmt .

docker-build: fmt
	docker build -t feedaka .

.PHONY: build fmt serve docker-build
