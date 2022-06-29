
# Plan of action

Oh oh oh! Now try type algebra???

Fixtures need to be fully usable:
- [x] I think builtins might be a per-file basis, not per-fixture
- [x] how to do aliases? I think it really makes sense to have it be in-source. Right?
	Because if I'm saving source files, they'll be in-source as well.
- [x] How to mark 'failed'? I guess I could have 'output:failed' instead of 'output'?
	oh maybe `output:expected` and `output:failed`. if there's just expected, we assume we're doing well
	if there's `output:failed` and no expected, that's fine too.
- [x] get 'alias'es parsing. I'll say the must be the first line? Might as well.
- [x] get parsing of the new fixture format working
- [x] move builtins to the top of the list, not inline
- [x] editable builtins
- [x] editable fixture input
- [x] update the devui n stuff
- [ ] make "Reject" do something
- [ ] hm have "Accept" & "Reject" there the whole time, so you can change your mind?
- [x] expect-error? yeah need `validate` happening here.

hmmmm wait what's the next

- [ ] I need source maps or some such, so that type reporting actually works correctly
- [ ] 



- [x] basic server
- [x] left panel with listing of files
- [x] load up the fixture text
- [-] ok I probably want react-router, let's be honest
	- not just yet though.
- [x] syntax highlight!!
- [x] underline on hover
- [x] alias things so it's not sooo noisy
- [x] figure out the text representation of the aliases
- [x] serialize & parse aliases for fixtures
- [x] actually use aliases during resolution
	- so if we come across a name with a given alias & no hash, we give it the hash, no questions asked.
- [x] new format for fixtures
- [x] edit title
- [x] better scrolling

- [x] have a button for writing everything back to disk.

- [x] show ... types ... of things ... on hover. I think I want like a `crawlTypes` or something that's like `getType` but more. Oh wait no maybe my getType doesn't go deep anyway, so that's ok.
	- ok so we crawl everything, get the types of expressions, and the ... resolved types of types or something
- [x] have hover follow mouse probs
- [ ] have hover stick on click, then you can hover entries there to get them underlined.
- [ ] dedup hover entries? idk.

- [x] BUG multiple dispatch isn't working?

- [x] editing of fixtures! probably? Can I do the same contentediable trick, but without the reprinting?
	like, just parse + recolor?
	seems like I've got to be able to do that.
	oh and maybe if there's a parse error, I can just like ... make everything slightly transparent?
	yeah that sounds fun.
- [x] fixtures can be wrong! make the "reject" button do something.
	maybe have a `-->[expected]` that we can toss in there.

- [x] main dealio is a listing of the fixtures in the selected file
	- [x] parse the .jd into constituent parts
	- [x] render the textarea, and a checkbox for whether it's supposed to succeed
	- [x] render the result, calculating the new result
	- [x] "save" on change.
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

