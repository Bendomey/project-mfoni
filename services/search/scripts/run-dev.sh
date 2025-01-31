
#!/bin/sh
srcPath="cmd"
pkgFile="main.go"
app="search-service"
src="$srcPath/$app/$pkgFile"

printf "\nStart running: $app\n"
# Set all ENV vars for the server to run
export $(grep -v '^#' .envrc | xargs) && time reflex -r '\.go' -s -- sh -c "go run $src -e development"
# This should unset all the ENV vars, just in case.
unset $(grep -v '^#' .envrc | sed -E 's/(.*)=.*/\1/' | xargs)
printf "\nStopped running: $app\n\n"