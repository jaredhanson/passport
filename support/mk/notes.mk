NOTES ?= 'TODO|FIXME'

notes:
	grep -Ern $(NOTES) $(SOURCES) $(TESTS)


.PHONY: notes
