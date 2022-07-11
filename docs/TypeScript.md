
Jerd is written in typescript, and also generates valid typescript, for easy integration into frontend projects.

Runtime representation:
- numbers (I'm not being precise with them, really quite at all?)
- strings (js strings)
- enums: options include
	- {tag: "someTag", payload: {...}} 
		- or 'type', 't', etc.
		- and 'p', 'data', etc.
	- {someTag: {}} (causes problems if it's 'toString', need Object.hasOwn, or Object.create(null) I guess?)
	- ['someTag', {...}]
	- for payloadless enums, it would be nice to be able to use bare strings
- records: {pojos}
- tuples:
	- if I represent tuples as "just" objects with numeric ... {0: 'hello', 1: 'friends'}
		honestly that sounds really clean. doesn't quite match with ts tuples though.
		but I do prefer the simplicity.
- effects:
	hm so hm.
