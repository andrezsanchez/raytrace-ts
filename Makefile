all:
	tsc \
	  --module commonjs \
	  --target es6 \
	  --strictNullChecks \
	  --noImplicitAny \
	  --noImplicitReturns \
	  index.ts \
	  --outDir ts-build
	browserify ts-build/index.js -o bundle.js
