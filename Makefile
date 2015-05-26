# Makefile Zen inspired by @mbostock
# https://github.com/d3/d3-selection/blob/99164693a37927b94bba1b125e9605186326963f/Makefile

GENERATED_FILES = \
	reactive-model.js \
	reactive-model.min.js

all: $(GENERATED_FILES)

.PHONY: clean all test publish

test:
	node_modules/.bin/faucet `find test -name '*-test.js'`

reactive-model.js:
	rm -f $@
	node_modules/.bin/browserify --standalone ReactiveModel lib/reactive-model > $@

reactive-model.min.js: reactive-model.js
	rm -f $@
	node_modules/.bin/uglifyjs $^ -c -m -o $@

publish:
	npm publish

clean:
	rm -f -- $(GENERATED_FILES)

