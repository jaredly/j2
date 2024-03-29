
## Structured Editor

### Selection, navigation?

hello ( 1 , 2 ) ( 3 , 4 )
^^^^^   ^   ^ editing an atom
	- if at the start, could be doing a binop from the right by adding a binop char
	- if at the end, could be adding a binop story
	- or could be adding a suffix

               ^         ^ the "end" of a callSuffix, the start of another, between suffixes

do .. I want to allow you to select
the "before" of an expression, even when it's the same visual place as the start of an identifier?
I don't think so? If you want to go up a level, just select the whole expression.

ok well so one way to do this is to say all we can do is modal stuff
- atom-edit-mode, we're editing an atom. some characters will take us up a level or whatever.
- selection-and-such-mode, we're selecting a something

Selection?
{type: 'edit', idx: number, at: 'start' | 'end' | 'change'}
{type: 'select', idx: number, children: null | [number, number]}
// how should I do "multiple" selection? I guess allowing for "children" selection.

OH NICE I can do onMouseDown & swap with a contentEditable, and click to select just works!!!
Very nice.

ok so also, I guess if you want to edit a larger node, I can just pretty print, and let you edit free-form.

### General, like it could be anything

This exercise of hand-writing the structured editor is super useful.

What I really need, is at-the-top focus control.
And the ability to select non-atomic nodes.
and the ability to move between nodes via the keyboard.

hmmmmm what if ... there was a way to ... unwrapp ... all nodes
so that references go through a toplevel map?
by loc-idx?
that way we can set up listeners, for each individual node.
and update a node without updating everything under the sun.

ok, and then we can do things like
....

wait, at that point should I even be using react?
🤔
hmmmmmmmm

anyway, so first line of attack:
- make an AST that uses a central lookup table.
	it can be an id -> { path: [the path to here], kind: 'Expression', value: Expression }


Ok, but before I do this, do I need to do the "blank" dealios?

What kinds of things do I want to ensure can "blank"?
- Expression, Applyable
- ... 

Ok I think maybe I don't even want contentEditable?
like maybe I'll try to take control of editing completely?
idk, might be too much work. but maybe not.
oh yeah so if I ditch contentEditable, then I get to use React!
Which is nice.


##

What about inferrable type application suffixes?

🤔

so, I feel like the inferrable type applications
in question, are only found immediately before
function calls.
`x<y>(z)`

could make things a little simpler, in that I could
do an inferred type application prefix on a callexpression.
of course in this case, I'd want to be .. inferring
... with the arguments already available ...
which I guess we would have?

🤔

so I'm a little bit sticking on ... the bit where
we're doing inference while parsing.

it seems like the "stack" might be a little hard to maintain.

so I'm wondering, if we have like a parse tree where
all of the inferrable things are just like "missing"

and then we do a traverse to fill those in.

yeah ok, so this means I need to write those traversal functions, right?

should .. I ... focus on that first, or on
making a structured editor?

I don't think I would need that for the structured
editor to work ...

#

So I think I'm going to need a `derived` dealio, for like
evaluating a raw number into an actual number,
and for booleans,
and for deserializing strings. (\\n to \n)

yeah I think that makes sense.

So, a derived dealio will need to specify .. in common terms...
what the typescript type is going to be, right?
or should I just restrict it to constants?
I guess I can say "you give the string name
of the type". That's fine.

##


So basically, I'll want to do a preprocessing pass on the whole grammar,
caching the 'prefixes' and 'suffixes'
like

'If I'm at an Expression blank, here are the characters that will map me to X node'
and 'If I'm at the end of an Applyable, here are the characters that will turn this into some other node'


Ok, so steps:

- identifiers
- application w/ CallSuffix
- binops w/ +-
- lambdas

... maybe?

worth a shot, seems like.

AND

- [x] generate TS types for the AST
- [ ] generate peggyjs grammar w/ transformers (& resolvers!)
- generate a printer AST->string
- figure out the best way to automate AST->babeljs?
- generate a structured editor of course!







OK SO NO left recursion at all. That's nice.

but still, I probably need special handling for binops.

like if I'm at 1 + 2 _
and I type "*" it needs to know we're making a ... n op with just 2 *, not (1 + 2) *

but if it's 1 * 2 _
and I type "+"
then we're jumping up a level.

like

"oh this is a binop char. Am I in some kind of binop already? If so, evaluate whether I need
to jump up a level in order to satisfy precedence."

Are there other characters that will have to do the same thing?

... I don't think so?

like, everything else should be able to just apply as tightly as possible ...

ugh ok maybe I'll try to avoid binops to start with?
or just, have them behave poorly? (like only allow +-, nothing else)

So interestingly,
'-' might be "we're doing a - binop"
OR
"we're doing a -> arrow application"

will have to suspend judgement, at least in that case.

Is there a way to automatically know that those two difference "next steps" are possible
without implementing a whole parsing algorithm?

# Implementation steps:

- identifiers
- application (basic bit of left recursion)
- constants? I guess these don't need to come till a bit later, but they're not too hard idk
- lambdas

- constants
- binops

^ left recursion


hmmmmm maybe I've been too .. over . sometihng . about this?
like, is it really that important to auto-infer left-recursion?
maybe it's just not feasible.

like

if you want to apply a lambda, you're gonna have to wrap it in parens.
no two ways about it.
but I don't think that can be inferred from the structure of the grammar.
or at least, I don't think it's obvious to a reader that it would be inferrable.


SO we have

Expression = Lambda / Binop

type Expression = Lambda | Binop | Apply | Applyable

(binop will allow fallthrough to apply)
(apply with allow fallthrough to applyable)

Type = TLambda / TBinop

type Type = TLambda | TBinop | TApply | TApplyable

Applyables
- applies (I mean they just get merged in ... maybe in a simplification step though)
	- so maybe we say they're not applyable? for the sake of argument
- constants
- identifiers
- ifs
- blocks
- arrays, enums, records, tuples (which is a superset of parened)

Nonapplyables
- lambdas
- binops

if you want a lambda in a binop, you'll have to wrap it in parens as well.

so binops can contain Apply / Applyable


ANYWAY
one big outcome of this, is there's no `Expression_String` visitor function that I can
totally rely on; because there are places where a String will be found that's just
an Applyable, not an Expression.
Not totally sure how I want to deal with that.
maybe have all three?
Expression_String -> Lambda / Binop / BinopChild
BinopChild_String -> Apply / Applyable
Applyable_String -> Applyable




# Autocomplete, and such

So
completion, in an auto-like way

Every ... "node" ... has the possibility of being ... "blank".

when constructing a blank node, like for an autocomplete snippet,
you could associate a type with it, but I don't think that'll be part of the AST.
yeah having extra stuff on certain kinds of blanks sounds iffy.



# Dealing with left-recursion

Seems like ...
the only places I'm allowing left-recursion is:
- "suffixes"
- "binops"

...
and that's it, right?

yeah that sounds about right.

anyway, so if you're at the end of a something, and you type a character, that might be the start of a suffix, or a binop, you need to wait until it gets obviously resolved?
Also I need a way to specify that there's some autocomplete goodness to be done.


# So, what's a reasonably simple way to build up this hullabaloo?

Getting binops to work at all is certainly a thing to tackle.
so like a basic math dealio?

And then, like separately,
a basic lambda dealio
maybe with ifs?

# So, I want my new grammar format to:

- generate the types of the (T?)Ast
- define Text -> (T?)Ast (peggy grammar + the transform functions)
- (T?)Ast -> Text (pretty-printer)
- (T?)Ast -> Structured Editor (React)

Howwww much do I care about alternative syntaxes?
I guesssss if I just make it so the alternative defintion produces the same generated Types,
then actually that's great? OK sounds fine to me.

how far can `inferrable` take me? maybe as much as I need to make this a true TAst?

the other big question mark, is with Atom/WithUnary/etc.

like
at the type level, I want

Expression = Apply | Switch | Number

but, to prevent left-recursion (which peggy doesn't like)
the grammar need to be

Expression = Apply
Apply = Atom Suffix*
Atmo = Switch | Number

hmmmmm so maybe all we need is auto-detection of left-recursion, and a way to ~fix it?

so also ... what about binops?
can I just lump those in with suffixes?
...

a + b.c - d.e

I might want some explicit support for binops? hmmm

so, in a counterpoint, maybe I /don't/ want binops to be "just fncalls"?
it's a little funky for them to jump back and forth.
and like, it's maybe a little convenient, but idk maybe not.

ok,
so we will need to do something special with precedence parsing ... of the binops
... and then printing I imagine? maybe? well I guess I'll have to do some fancy
un-recursing of the dealios anyway.
