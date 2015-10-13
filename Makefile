all: clean debug shim copy
debug:
	scripts/build --debug
shim:
	scripts/build
copy:
	cp onion-sticky.js dist/onion-sticky.js
clean:
	rm -rf dist/*
