
Ok basic idea:
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

