# Decorators

So, I've been initially basing things off of ocaml's decorators.
Where there's a special syntax, and you can drop in things like types and patterns in addition to
... expressions.
It does seem like this would be useful for when I'm doing macros.

... but ... I think I'm planning on having macros behave a little differently?
Or rather, have different syntax for decorators vs macros.
Basically my question is:

Can I have decorators be ... values? like, specifically records.
b/c I'm thinking of error reporting, right
and I'm like "what if I could represent type errors in-universe
because why not I guess?

and it could be like

@TypeError
@ResolutionError

and such.

Now, ResolutionError should list the options considered, so we need to be able to
represent IDs in-universe. Which I think would be useful anyway. I guess it's another primitive?
eh and I don't love the need to come up with new syntax for it.
`#[hsomething]`. Maybe two hashes? might be interesting. And it would work.

Ok but then there's the matter of "I expected this type, but got this other one".
and I don't have a way to represent types as values.
Should I just go ahead and codegen up my typed-ast in-universe? Then I could definitely
start representing things.
And I do want to do that eventually.
Ideally I would also be codegenning a way to convert from js->jd->js.
So I can just go `ToJd[typ.type](typ, ctx)` and it would get the job done.

oh wait lol I need to be able to produce record types, and like recursive types, and kindof a whole bunch of other stuff first. hah.

OHWAIT so then I want quoting! So I don't have to write out `TRef{Ref::Global{id: ##[someid]}}`.
huh yeah I'll have to figure out how to turn IDs into my ID primitive instead of a record.

ooh I wonder if I can write compile-time arbitrary type bound macros?
hmm but if I don't work within the world of the type system, then whatever's handling the value will still have to account for filtered-out stuff. So that's not awesome.

To clarify: What I'm thinking I'll probably want is a way for macros to indicate more clearly what kinds of things they'll accept. Not just an `Expression`, but an `Apply` with an `Int` and a `Float`.
...
So, the fact that all of my enum options are their own records seems like it ought to help some?
but it ... doesn't quite.
```
struct Apply {
	args: Array<Expr>,
}
```
We can't say `args needs to be length 2, where the first arg is an Number with kind "int"`