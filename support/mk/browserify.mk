BROWSERIFY ?= browserify
BROWSERIFY_MAIN ?= index.js
BROWSERIFY_OUT ?= build/bundle.js

build-browserify: node_modules
	mkdir -p build
	$(BROWSERIFY) $(BROWSERIFY_MAIN) -o $(BROWSERIFY_OUT)


.PHONY: build-browserify
