all:
	protoc \
		--plugin=./tools/protoc-gen-go \
		--go_out=grpc \
		--go_opt=paths=source_relative \
		--plugin=./tools/protoc-gen-go-grpc \
		--go-grpc_out=grpc \
		--go-grpc_opt=paths=source_relative \
		--proto_path=../common/protobuf \
		feedaka.proto
