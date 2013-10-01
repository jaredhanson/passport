JSHINT ?= jshint

lint-jshint:
	$(JSHINT) $(SOURCES)


.PHONY: lint-jshint
