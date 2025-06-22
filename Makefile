serve: build
	FEEDAKA_BASE_PATH="" FEEDAKA_PORT=8080 ./feedaka

build:
	npm run check
	npm run build
	go build -o feedaka main.go

fmt:
	go fmt .
	npm run fmt

docker-build: fmt
	docker build -t feedaka .

.PHONY: build fmt serve docker-build
