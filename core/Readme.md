


You've got ExpressionWrappers, which are applied in some kind of order.
And then Expressions, which are ORd together
Suffixes are used by WithSuffix, and are made available if we want.
And the topmost ExpressionWrapper is what we call Expression.

We can use this principle in other places, to do other kinds of wrappers, for Toplevels mostly I think idk


Anywayy we don't build a traverser for the peg ast, because we're expecting to immediately turn that into the tast.

BUT
the tast might contain errors.
ALSO
parsing won't be technically "error resiliant", because we're betting it all on structured editor.

the tast might also have unresolved/unspecified types. idk how to do that really well.
would need to come up with some pathalogical test cases to see how it is.

but then, expressionWrappers end up being siblings of expressions, right? and suffixes do too, for that matter.
I mean WithSuffix doesn't really, it gets turned into other stuff.

binOp -> is it just sugar for an apply at the end of the day? even at the tast level? Probably? as is unary ... so ... we end up with none of the expressionWrappers producing tast nodes.
BUT then how do we know how to turn the tast node back into these things, for printing & structured editing?

welllll so for structured editing, we don't want to /lose/ the information we gained in the tast, so we can't just do a direct "convert it back to the ast and then show that". Unless we think the syntax is powerufl enough to lock everything down, which I guess in theory it should be.
hm.

huh so maybe for printing to .jd we /do/ need a visitor/transformer for the peg ast nodes. interesting.

onnn the other hand, if I colocate it well enough, maybe I don't need to autogenerate the printing & structured editing. if I just have things in the same file, then it's easy to adjust & keep things in sync. yeah. Because I do want to have lots of flexibility with the structured editor, so it can be really nice to use.

anyway, back to ... some things.
BinOp is a kind of apply(), as is UnaryOp.
What if I had them unified in the grammar? Would that be very weird?

