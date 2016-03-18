develop: clean debug shim copy
test:
	node_modules/.bin/karma start karma.conf.js
watch:
	node_modules/.bin/watch --wait 1 "scripts/develop" ./src ./test
debug:
	scripts/build --debug
shim:
	scripts/build
copy:
	cp src/onion-sticky.js dist/onion-sticky.js
clean:
	rm -rf dist/*
