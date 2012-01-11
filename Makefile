NODE = node
TEST = ./node_modules/.bin/vows
TESTS ?= test/*-test.js test/**/*-test.js test/context/http/*-test.js

test:
	@NODE_ENV=test NODE_PATH=lib $(TEST) $(TEST_FLAGS) $(TESTS)

docs: docs/api.html

docs/api.html: lib/passport/*.js
	dox \
		--title Passport \
		--desc "Authentication framework for Connect and Express" \
		$(shell find lib/passport/* -type f) > $@

docclean:
	rm -f docs/*.{1,html}

.PHONY: test docs docclean
