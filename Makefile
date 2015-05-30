# Makefile Zen inspired by @mbostock
# https://github.com/d3/d3-selection/blob/99164693a37927b94bba1b125e9605186326963f/Makefile

GENERATED_FILES = \
	dist/reactive-model.js \
	dist/reactive-model.min.js

all: $(GENERATED_FILES)

.PHONY: clean all test publish

test:
	node_modules/.bin/mocha

dist/reactive-model.js: src/reactive-model.js
	- rm $@

  # The built bundle source code is infinitely nicer with Esperanto as compared to JSPM.
	# However I can't seem to figure out how to get graph.js included in this bundle.
	./node_modules/esperanto/bin/index.js -i src/reactive-model.js -t umd -o dist/reactive-model.js -n ReactiveModel -s -b

  # The bundle built by this command looks like it has way too much stuff in it,
	# and it's not clear how to expose ReactiveModel as UMD from this,
	# but the resulting bundle does contain graph.js.
	# node_modules/.bin/jspm bundle-sfx src/reactive-model $@

dist/reactive-model.min.js: dist/reactive-model.js
	- rm $@
	node_modules/.bin/uglifyjs $^ -c -m -o $@

clean:
	rm -f -- $(GENERATED_FILES)

