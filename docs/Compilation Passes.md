
TAST -> IR



// So, exprs that would turn into statements ...
// get turned into 

() => {
	let x = if 10 > 2 {
		34
	} else {
		12
	};

	hello(if true { 10 } else { 2 })
}

() => {

}



---

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
- switch -> returns?
	Althouuuugh, we could do switch->if/else and stay in-universe, right?
- so really it's "if/else expr -> if/else stmt"?

hmmmmm do I just leave patterns as-is?
let's try that.

Ok but what about for & while loops? jerd doesn't have either,
but imperative targets will. So it makes sense to have an IR
that knows about them ... right?
