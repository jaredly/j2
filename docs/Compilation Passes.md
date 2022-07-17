
Here are the things I'm thinking of:

- turn effects into (either a state machine or) CPS
	ok new plan, it'll be Tasks the whole time.

So, we no longer have algebraic effects as separate from the main runtime, which I like. So we don't need a 'turn effects into CPS everywhere' pass.
but there will be an async/await style transformation at the function level
BUT that can still all happen within the TAST.

So, within the TAST:
- transform all (!) invocations to tasks
	This is nicely a local transformation
- monomorphize
	- Dunno if this is immediately required. I don't know how much JS can put up with, or typescript for that matter. Although now that I'll be keeping the most complicated transforms within the TAST, I might not need to actually generate typescript.
- there's probably some level of in-universe sub->supertype conversion that can be done (at least inflating with default values)

TAST -> IR
- insert converters wherever a subtype is being passed, right?
	although, what exactly the converters need to do is platform-specific (js doesn't care about smaller/larger enums, for example)
- returns and such
