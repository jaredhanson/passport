SOURCES = lib/**/*.js

# ==============================================================================
# Node Tests
# ==============================================================================

VOWS = ./node_modules/.bin/vows
TESTS ?= test/*-test.js test/**/*-test.js test/context/http/*-test.js

test:
	@NODE_ENV=test NODE_PATH=lib $(VOWS) $(TESTS)

# ==============================================================================
# Static Analysis
# ==============================================================================

JSHINT = jshint

hint: lint
lint:
	$(JSHINT) $(SOURCES)


.PHONY: test hint lint
