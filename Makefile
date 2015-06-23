# Makefile Zen inspired by @mbostock
# https://github.com/d3/d3-selection/blob/99164693a37927b94bba1b125e9605186326963f/Makefile

GENERATED_FILES = \
	reactive-model.js \
	reactive-model.min.js

BIN = ./node_modules/.bin

all: $(GENERATED_FILES)

.PHONY: clean all test list

test: clean all
	$(BIN)/mocha

reactive-model.js: src/reactiveModel.js
	$(BIN)/rollup -m inline --output $@ --format cjs $^
reactive-model.min.js: reactive-model.js
	$(BIN)/uglifyjs $^ -c -m -o $@

clean:
	rm -f -- $(GENERATED_FILES)

tree:
	tree -I node_modules
