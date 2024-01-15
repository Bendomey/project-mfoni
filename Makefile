
run:
	make -j 3 run-api run-fe open-browser
.PHONY: run

run-fe:
	cd apps/client && yarn dev
.PHONY: run-fe

run-api:
	cd services/main && make run-dev
.PHONY: run-api

open-browser:
	open http://localhost:3000
.PHONY: open-browser