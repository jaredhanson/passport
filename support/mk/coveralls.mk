COVERALLS ?= coveralls

submit-istanbul-lcov-to-coveralls:
	cat $(ISTANBUL_LCOV_INFO_PATH) | $(COVERALLS)


.PHONY: submit-istanbul-lcov-to-coveralls
