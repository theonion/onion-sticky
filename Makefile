all: clean debug shim copy
watch:
	node_modules/.bin/watch "make all" ./src
debug:
	scripts/build --debug
shim:
	scripts/build
copy:
	cp src/onion-sticky.js dist/onion-sticky.js
clean:
	rm -rf dist/*
