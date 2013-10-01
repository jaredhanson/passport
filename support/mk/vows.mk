VOWS ?= ./node_modules/.bin/vows
VOWS_REPORTER ?= --spec

test-vows: node_modules
	NODE_PATH=$(NODE_PATH_TEST) \
	$(VOWS) $(VOWS_REPORTER) $(TESTS)


.PHONY: test-vows
