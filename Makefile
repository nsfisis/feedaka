serve: build
	FEEDAKA_BASE_PATH="" FEEDAKA_PORT=8080 ./feedaka

build: fmt
	npm run build
	go build -o feedaka main.go

fmt:
	go fmt .

docker-build: fmt
	docker build -t feedaka .

.PHONY: build fmt serve docker-build
