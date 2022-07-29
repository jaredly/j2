
Ok, interesting thing about records:
- default values! like definitely (??)
	actually now I'm not so sure.
	is that just like ... providing a seamless upcast?
	I guess that's cool.
	`{x: 10} as pos` (fills in y = 0)
- we can spread in other things, that's fine

So, yeah with default values, what restrictions do I put on the kind of expressions
that can live in there? I'm guessing it's just "no referencing anything non-global"?
because otherwise that would get really weird.
