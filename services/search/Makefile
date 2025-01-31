run:
	$(MAKE) gen-protos
	chmod u+r+x ./scripts/run.sh && scripts/run.sh

# install reflex to run forever: brew install reflex
run-dev:
	chmod u+r+x ./scripts/run-dev.sh && scripts/run-dev.sh

build-server:
	chmod u+r+x scripts/build.sh && scripts/build.sh

build-docker:
	chmod u+r+x scripts/build-docker.sh && scripts/build-docker.sh

# install golangci-lint to run: https://golangci-lint.run/welcome/install/
lint:
	gofmt -w . && golangci-lint run

# install protoc to run: https://grpc.io/docs/protoc-installation/
gen-protos:
	chmod u+r+x ./scripts/genproto.sh && scripts/genproto.sh
