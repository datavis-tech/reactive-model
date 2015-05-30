# Inspired by https://github.com/d3/d3-selection/blob/master/Makefile

GENERATED_FILES = \
	dist/graph.js \
	dist/graph.min.js

all: $(GENERATED_FILES)

.PHONY: clean all test

test: dist/graph.js
	./node_modules/.bin/mocha

dist/graph.js: src/graph.js
	- rm -f $@
	./node_modules/esperanto/bin/index.js -i $^ -t umd -o $@ -n Graph -s
	chmod a-w $@

dist/graph.min.js: dist/graph.js
	- rm -f $@
	node_modules/.bin/uglifyjs $^ -c -m -o $@
	chmod a-w $@

clean:
	rm -f -- $(GENERATED_FILES)
