JSHINT ?= jshint

lint-jshint:
	$(JSHINT) $(SOURCES)

lint-tests-jshint:
	$(JSHINT) $(TESTS)


.PHONY: lint-jshint lint-tests-jshint
