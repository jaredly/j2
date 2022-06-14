
thinking about builtins
you know, I could just go ahead and give
ints and strings and stuff just a whole ton
of .attributes. like myInt.toFloat() myString.slice() etc.
Would really juice up the feel of it I bet.

what ifff you can just up and declare `let .awesome = (x: int) => () => "is awesome"`.
And then you get `x.awesome()`?
hrmmmmmm oh we run into the weird unit argument.
oh wait no I guess that's fine! yeah I mean that works right? The first is called
when you `.awesome(x)` and then it's `.awesome(x)()`. Totally normal.

now, this seems like a pretty special case, right? You can't just go around naming
things with `.` in front. right??
`(x: int, .y: (v: int) => int) => x.y` like ... is that weird? idk.
it's not like that syntax is reserved for anything else.

hmmmmm does that mean, that for any builtins that don't have any args (like toString)
I'll just forgo the second set of lambdas? I mean might as well right?
but then for toString we've got `as string` as well, so whatayado.

---


So, I'm having some thoughts about Record types.
It would be really, really convenient in a lot of ways,
for Records to be ~anonymous.
you could just declare `parseInt: (value: string) => Result<int, NotAnInteger{}>`.
so like, that's a payloadless record, for sure.
```ts
enum Result<Ok, Failure> {
	Ok{Ok},
	Failure{Failure}
}

Result::Ok{: hmmm} // you can only do positional if no names are given.
.0(myOkValue) // will work
```

hmm yeah ok lots of things would fall apart. I guess we can't do that.

BUT

Ok I'm declaring that ... you can just drop `NotAnInteger{}` in a place where you're using
a type, and it's the same as declaring it in-line.
Yeah I said it.
I think that's a nice.
If you want to re-use it elsewhere go for it.
idk it might be weird. But it's the same basic idea as inline declaring enums, right?
yeah that sounds rad.