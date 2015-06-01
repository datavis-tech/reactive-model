# Makefile Zen inspired by @mbostock
# https://github.com/d3/d3-selection/blob/99164693a37927b94bba1b125e9605186326963f/Makefile

GENERATED_FILES = \
	dist/reactive-model.js \
	dist/reactive-model.min.js

BIN = ./node_modules/.bin

all: $(GENERATED_FILES)

.PHONY: clean all test publish

test:
	node_modules/.bin/mocha

dist/reactive-model.js: src/reactive-model.js
	- rm $@
	$(BIN)/browserify $^ -o $@

dist/reactive-model.min.js: dist/reactive-model.js
	- rm $@
	node_modules/.bin/uglifyjs $^ -c -m -o $@

clean:
	rm -f -- $(GENERATED_FILES)

