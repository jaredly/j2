# Nore (new-core) Roadmap

Highlevel things I haven't solved at all:
- pretty-printingggg
	so, breaking long lines.

## Selection working

- [x] delete empty type annotation
- [x] left from type annotation, it goes to an empty. I don't want it to be an empty

- [ ] it would be great to do some pretty printing dealios


- [x] basic goRight
- [x] right out of fn body isn't owrking
- [x] make Empty's actually a text editorrr
- [x] basic goLeft
	- oh it's breaking some
	- need to actually keep going once I've hit the punct I need,
		in case there's a sibling that is the same punct level as me.
		and atoms and stuff will have a traverse in, so we won't skip over them.
- [x] make clickside work
- [ ] ugh I want tests for my navigation functions.
- [x] goLeft & goRight should continue to go /deeper/ if applicable.

- [x] remove path from selection
	- [x] make goLeft and goRight return the new selection & the path or sth idk
- [x] fix comma to select the new blank
- [x] blanks should auto-select for 'change' probably
- [x] make comma work for callsuffix
- [x] do a similar thing for '(', ...
	- [x] and ')'
- [x] allow deletion of args
- [x] deletion of suffixes
- [ ] the blank that is a potential arg should work pls
- [ ] autocomplete 'fn' where appropriate, might need to wrap in parens in some cases.


- [ ] make the editor do something!
	- SO I think at least for the Empty in an Args, I should be able to
		pass in the kind of thing you should be able to parse, right?
		although parsing per se isn't quite the name of the game.
		a given empty thing can only go a certain number of ways.
		`fn` for a fn, digits for a number, alphanum for an identifier.
		eventually `(` and `{` for tuples and records, `'` for enums or sth.
	- [ ] if you ',', handle that
		if you're /before/ a thing (or at the start of an atom I guess)
		then we want a new arg before the current one. otherwise, after.
	- [ ] if you do something else ... 
		like binops eventually, or also fn call suffixes I guess.
		this'll probably be bespoke until it's not? idk
- [ ] autocompleteeeeete
	- need to seed the context with some globals


## Ok more selection

childCountForPath?
childThingsForPath?

ok, so like the ... efficient version would be to ... start at the top! Of course.
Don't need to start at the bottom. ok.
yeah, the childPositions doesn't need to be recursive.

`LambdaChildren()`
`ExpressionChildren()`




## AUTOGEN REACT

- so good

## Autogen to-map from-map

gotta have it

- [x] to-map, it's good
- [x] from-map, less critical, but still cmon

## Selection stuff?

so should I just do the boundingbox dealio for selection movement too?
seems annoyingly crude.

should I say that ... there's a numeric index to each selection point?
and so "current selection" would be an array of integers?
Seems like a reasonable way to do it.

- [x] populate `path`... with the numbers?
	- in a given dealio, have like `path.concat([pos++])` or something
	- and then we need a function that is "get number of sub-selections"
		Now going left/right is as simple as +/- one.
		BUT how do we know if a given index corresponds to something we can dive into?
		Should I ... construct like a tree of selection positions?
		OR maybe I just have a function that is "childCountForPath" and if it's
		0, then there's nothing to dive into, otherwise there is.
		That sounds nice actually.
- [ ] generate "childCountForPath" (or it could be runtime analysis of the grammar json)
	- maybe include the idx's (if any) for the relevant children? yeah, idx + child cound. Sounds great.

Sooooo what about the whole fancy type-specificable path dealio that I cooked up?
maybe give all the types a `cid: number`. yeah that sounds good?


Cases that I want to work:
- click ing the left side of `(` in `hello(what)` should select the end of `hello`, not the `Empty` that is `before` the CallSuffix.
	- it'd be ok if it first selected the `Empty` and then ~slid to the identifier though.


#

Lisp, when it hits an "exception", it pops up an interactive question:
- do you want to retry?
- do you want to specify a different function that it should call?
- modify the env and then retry?
- or abort wholesale



"punchcard compatible"

"stop the world type checkers"

look into Erlang/OTP

Clerk ; clojure













### Testingggg

#### Making a test recorder!

- [x] I want to be able to "highlight" a thing... when mousing over a dealio

#### The 'level'

Maybe I don't want it? Try removing, and just have the Path

### Structured Features

#### First Step: basic editing, navigation, and selection

letsssssss autogenereate the UI

##### Editing Stuff

- [ ] testsssss?? pleassse??
	- ok, so my reliance on contentEditable means I can't actually test using jsdom.
	  sooooo does this mean I should try to make a version that uses `<input>`?
	  would that require a bunch of modifications? Or would it be ok?
	  oh wait, I'll just do it ...
	- nice ok, testing-library in an actual browser

- [x] # Identifiers
- [x] # Numbers
- [ ] # Apply/CallSuffixes
- [ ] UNDO/REDO
	- isolate logic that changes things
	- make sure every place I change things, I record a history item.
- [ ] fix bug around ',' placement while in a non-id'd CallSuffix_arg
- [ ] make a 'debug drag select' mode, so I can know what's going on when it goes sideways

- [ ] binops probably??
- [ ] lambdas, which means patterns, yaknow


- [x] basic atom edit
- [x] click a paren, select something close to it
	- [ ] setSelection should go into selection, I think? ... 
- [x] backspace to remove ... an arg
- [x] if no args, remove the callExpression
- [x] clicking the left / right side of a `(` should do the expected
- [x] simplify AtomEditor

- [x] ooh ooh BUG
	If I click into something else, it removes selection from the thing I was
	editing, which gets unmounted, and then ... we lose that info.
	- yay fixed

- [x] so, thinking about blanks. obs with an arg ... that's not the sole arg,
	we want to leave it as a blank.
	but if it's the only arg, I think we ditch it.
- [x] allow selection into the "interior" of a thing. like at: 'inner'

- [x] ',' comma to add an argggg
	- [x] fix double-remove
- [x] CallSuffix end _ backspace should remove
	- oooh OK so, backspace should switch it to `select:edit,at:change`
	- and then another backspace removes it. yeah that makes a lot of sense.
- [x] better suffix backspace
- [x] CallSuffix inner + backspace hsould remove
- [x] ')' in an arg should select the end of the CallExpr
- [x] selecting the start of an apply should ... select the start of the target.

- [x] ARROW KEYSSS
	- so, navigating ,right?
	- got it good

- [x] selection?? should I do vim mode? or not yet?
	- [x] not yet on the vim mode
	- [x] collect boxes for nodes
	- [x] do a lowest common parent
	- [x] figure out how to allow selecting multiple children

- [ ] do live updates for atomedit indicating parseability
	- hmm do I actually need this? hmm

- [x] drag to select ... I'll do the thing like I do, for drag & drop;
	- have a central registry of all dom nodes
	- gotta make sure to prune it folks
	- on drag start, calculate relevant points
		- use start & current mousepos to figure out the proper selection

- [ ] UNDO REDO ahhhhh ok so I do in fact have to stop editing things in-place, so that I
	can do an undo stack.
	yeah that makes sense.
	- [ ] um command pattern? maybe? idk probably.
		- "Replace node"
		- "Delete node"

BEFORE I get too far, let's make sure UNDO/REDO is a thing

OHHHKKKK I guess I want a central command pattern. fine.
then I can just pop any modified map nodes into an object, along with the current selection state.
that'll be nice.

#### Second Step: IDE features, autocomplete, etc.

- [ ] autocomplete an identifier
- [ ] when producing a `CallSuffix`, if the type of the thing is known, go ahead and populate `Blank`s for each expected argument. Would be great if the blanks knew their desired type, and even label if applicable.



## Structured Editor

- [x] loc's need an `idx`
- [x] gen type for locs
- [x] need to gen types w/ indirection.
	- so anywhere there's a "ref", we go with `number` which is an idx
- [x] handwrite a transformer from the straight tree to the indirect one? and back I assume? 🤔
	- or do I just want to go whole hog on the indirect version?
		I mean when I do a hash, I probably don't want to be involving the random idxs.
		so yeah I probably do want to be able to convert back.
		Also, for general tree manipulation, and like codegen and stuff, I probably want a straight tree?
- [x] try a structured editor with the mapified version!
	- central store, with
	- the map of idx -> stuff
	- listeners for when a stuff changes
	- the current state of selection 🤔
		- how do I define selection? like ... hm
			or maybe the state of selection lives in the DOM?


### Laters

- [ ] autogen the to-map dealio, it's fine to be handwritten for the moment tho

## Getting something all the way I think

ident-const-apply

- [x] gram definitions
- [x] gram->ts
- [x] gram->peg
- [ ] gram->structured editor???????

LATER I think I'll do AST->infer->AST
- [ ] (peg->infer)
	- oh so maybe I can do inference? like maybe I can ...
		just need to wrangle myself a global ctx...
