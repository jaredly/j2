
Hmmm I'm thinking about suffixing numbers to indicate what type they are.
Should I do that?
hmm ... that would make it unambiguous, sure.
orr I could require that floats have a period.
hmm.
Because, if I print out ...
ok, the issue I'm thinking of is: what if we start with ints, but then I need them all to be floats, and it's like `(1 + 2) * 3.5`
if I lock down the numeric types
`(1i + 2i) * 3.5f` then I can't just "reinterpret" them as floats on the reparse.
BUT we're not reparsing, are we?

And so I'm thinking instead about autofixing.
And like, if we see: the expressions involved could be fixed by switching to float versions of everything;
Presenting a dropdown? Of the potential things to fix?
Yeah I'm imagining like dropdowns showing up at all of the error places (well one at a time) and you can tab between them if you want; if there are multiple autofix options of course

AND autofixers will like have a "do I apply to this situation".
Anyway, and the dropdown will have numbers for each option, so you can just select by the keyboard. Also probably you can type to quickfilter.

`1i + 2i` (working, everything's resolved)
`1i + 2.0f`
[error: the 2.0f was expected to be an int]
[Autofix]
1. replace with `2i`
2. covert to a int with `2.0f as int`
3. change `+` to be something that's looking for `int, float`
	(will only show up if I can reasonably find a function that fits the bill)

If there's an error with only one known autofixer, do I want to just automatically apply it? hmm that seems risky.

For all autofix actions, it could be nice to have an 'action log' off to the size, indicating what changes have been made.

Ok, so I'm not going to worry about locking things down.
Which means, that I'm not going to worry about numeric ambiguities anymore?
idk. anyway, if it has a '.', it's a float, at least for now. Can probably change later.
