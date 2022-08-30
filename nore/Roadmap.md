# Nore (new-core) Roadmap

## Structured Editor

- [x] loc's need an `idx`
- [x] gen type for locs
- [x] need to gen types w/ indirection.
	- so anywhere there's a "ref", we go with `number` which is an idx
- [x] handwrite a transformer from the straight tree to the indirect one? and back I assume? 🤔
	- or do I just want to go whole hog on the indirect version?
		I mean when I do a hash, I probably don't want to be involving the random idxs.
		so yeah I probably do want to be able to convert back.
		Also, for general tree manipulation, and like codegen and stuff, I probably want a straight tree?
- [ ] try a structured editor with the mapified version!
	- central store, with
	- the map of idx -> stuff
	- listeners for when a stuff changes
	- the current state of selection 🤔
		- how do I define selection? like ... hm
			or maybe the state of selection lives in the DOM?

- [ ] autogen the to-map dealio, it's fine to be handwritten for the moment tho

## Getting something all the way I think

ident-const-apply

- [x] gram definitions
- [x] gram->ts
- [x] gram->peg
- [ ] gram->structured editor???????

LATER I think I'll do AST->infer->AST
- [ ] (peg->infer)
	- oh so maybe I can do inference? like maybe I can ...
		just need to wrangle myself a global ctx...
