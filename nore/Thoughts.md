
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
