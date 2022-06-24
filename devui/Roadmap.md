
# Plan of action

- [x] basic server
- [x] left panel with listing of files
- [x] load up the fixture text
- [-] ok I probably want react-router, let's be honest
	- not just yet though.
- [ ] main dealio is a listing of the fixtures in the selected file
	- [ ] parse the .jd into constituent parts
	- [ ] render the textarea, and a checkbox for whether it's supposed to succeed
	- [ ] render the result, calculating the new result
	- [ ] "save" on change.
- [ ] hmm could I also have some sort of coverage reporting built in? that would be very cool



# Ok basic idea:
- I want ... to be able to read from the file system, so I can persist these fixtures.
- It's OK for fixtures to be human-readable but not writeable. So we can do "json blob w/ pretty print" and have the json blob be source of truth.

A Fixture (for parse + type + reprint) consists of:

[inputs]
- .jd text
- whether we expect it to be fully valid
[outputs]
- tast
- printed .jd
- validation results
- whether it's passing (maybe with a text note?)

So, the states that a fixture might be in:
- all clear
- same as disk, but not passing
- changed from disk (pass status unclear)

So
ugh can I repurpose my other dealio? idk. that was built using esbuild, and no compoennt library.

