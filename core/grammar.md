
Toplevels

```
struct What {
	...IneritsFromThis{with: defaults},
	name: Type = defaultValue,
	// This will be usable as a binop, yay
	"+~": (int, int) => int,
	// This will be usable as a unary op
	"+": (int) => int,
}

enum What {
	...SomeOtherEnum,
	What<int>,
	// Just a shortcut for defining this separately
	Dog {},
}

type Alias =

effect What {
	id: (name: int, arg: float) => string
}
// cannnnnnnn effects just be a special form of enum or somethinggg
// because like they're currently thought of as functions.
// and like they're not really functions.
// hmm what if it's just like an enum?
// and ... one of the names is ... pure? no no no
// maybe one of them ... just takes a single argument?
// wait you can't make an enum out of ... um ... things

/* OK SO
An effect consists of:
A set of CONSTRUCTORS

each constructor has
0 or more ARGs (nice if they were named)
0 or 1 RETURN type
which like, is almost like functions, except for the 0 return type part.


// Ok but what if this created an enum anyway? could be nice.
effect Store {
    get: () => int,
    set: (int) => void,
}

effect Store {
	Get{} => int,
	Set{value: int}, // no return value
}

enum Store {
	@effect(:int)
	Get{},
	Set{value: int},
}

// yeah that's kindof cool?
// like I don't assume people will be making effects a whole ton idk
// but I like that handle is now just a switch of `Effect<Store>` ??? I mean there's a little more to it, how does it know what `k` is. hmmm
// yeah nvm thats not quite the deal.
// ok would this interact weird with ... enum inheritance?
// hmm.
// 
throw!(Store::Get{})


let rec loop = (value, fn) =>
	handle! fn {
		Effect::Effect{value: Get, k} => k(10),
		Effect::Effect{value: Set{value}, k} => loop(value, k),
		Effect::Pure{value} => value
	}

*/



// how would I do something like abilities?
// this is like ... just a something that can be passed in ... right?

decorator What {}

let Definition = ...

(toplevel expr)

so it's like, a named (or not) expr, right?
```

Expressions

```
A binop B
binop = +*^/<>=|&- ...

// SOOO BINOPS:

unop A
unop = - + !

# suffixes:
<int>{eff}(arg, arg, arg)
.attribute
[index] [1:3, 4:5]
as typeConversion

EnumLiteralhmm<>:Expr
RecordLiteral<>{}{ what, thing, ...spread } // oh rite

<item>[1, 2, 3, ...stuff]

(2, 3, 4)



{
	// block oh right
}

if expr { yes } else { no }

switch expr {
	pattern => body
	2 as x =>
	[a, 2, ..., 3] =>
	What{a, b: 3} =>
	(2, a) =>
}

raise!
handle! expr {
	What.thing(arg) =>
	pure(v) =>
}

<A: subtype, B>{e}(arg: type, arg2: type) ={int}> body






```

what about argument names?
hmmm

Everything can be decorated
and comments can be anywhere right
