all:
	tsc --target es6 --strictNullChecks --noImplicitAny --noImplicitReturns index.ts --outFile bundle.js
	#./build.js > bundle.js
