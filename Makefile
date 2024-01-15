
# make -j 2 run-api run-fe
run-fe:
	cd apps/client && yarn dev

run-api:
	cd services/main && make run-dev
