all:
	tsc
	browserify ts-build/index.js -o bundle.js
