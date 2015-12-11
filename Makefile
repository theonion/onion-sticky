all: clean debug shim copy test
FORCE: # Depend on force to force a task to run always
test: FORCE
	node_modules/.bin/karma start karma.conf.js --single-run
watch:
	node_modules/.bin/watch --wait 1 "clear; make all" ./src ./test
debug:
	scripts/build --debug
shim:
	scripts/build
copy:
	cp src/onion-sticky.js dist/onion-sticky.js
clean:
	rm -rf dist/*
