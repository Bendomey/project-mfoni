

# Run once to trust the self-signed certificate
trust-https:
	dotnet dev-certs https --trust

# Run application.
run-dev:
	dotnet run --launch-profile Development

run-staging:
	dotnet run --launch-profile Staging

run:
	dotnet run --launch-profile Production

build-release:
	dotnet publish -c Release -o out

build-docker:
	docker build -t mfoni-api -f Dockerfile .

lint:
	dotnet format main.sln