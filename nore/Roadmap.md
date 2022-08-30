# Nore (new-core) Roadmap

## Structured Editor

- [x] loc's need an `idx`
- [ ] gen type for locs
- [ ] need to gen types w/ indirection.
	- so anywhere there's a "ref", we go with `number` which is an idx

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
