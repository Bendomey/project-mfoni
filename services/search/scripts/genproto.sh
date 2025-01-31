# protos are loaded dynamically for node, simply copies over the proto.
mkdir -p internal/protos
cp -r ../protos/* ./internal/protos

protoc --proto_path=internal/protos --go_out=./internal/protos --go_opt=paths=source_relative --go-grpc_out=./internal/protos --go-grpc_opt=paths=source_relative internal/protos/**/*.proto