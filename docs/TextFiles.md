
Ok but here's a question.
What if hashes were contained in []?
`hello#[builtin]`?
`hello#[abcd.12]`? 
I kinda like it.

```
hello#[b] #[builtin]
.awesome#[abcd.0] // record type and idx

```

Anyway, when thinking about the "output with ~unique names"
I'll uniqueify everything that's relevant:
- meaning, unique symbol names, unique reference names
	and if I need to use an incorrect(augmented) name for a
	reference, that's fine
	can I have a bare ... something?

alias abc #[hello]
alias cde #[hwhatsit]
alias abc #[hello] cde #[hwhatsit] T #[0] T1 #[1] a #[4]

hmm do I really need the aliases for local vbls? I don't think so?
I can just change them to be all unique.
The point of the alias declaration is to insulate the term from changes around it, and local variable declarations can't be impacted by that.

OK so also, I should make the rule that: a global vbl can never
/win/ over a local vbl. I think that just makes sense. That is to say, when parsing, if there's one local vbl, we don't even need to
check the global registry.
SO if, when serializing we're using a global vbl with the same
name as a local vbl, we modify the global vbl's alias. it's cool.
