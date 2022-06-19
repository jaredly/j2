These files contain:

1. A grammar snippet, defining how to parse, from which Ast types are derived
2. type definitions for the typed tree version of those Ast nodes, that are imported into  `typed-ast.ts`
3. ToTast functions for going from Ast to Tast
4. ToAst functions for going back
5. ToPP functions for going from Ast back to text

I'm somewhat hopeful that (5) will be automatable at some point.

Scripts that will make things just a little bit simpler:
- a script to gather the grammars and plop them into base.pegjs (p grammar should do this)
- a script to update typed-ast imports at the top
- a script for starting a new file, with the right names of things. (I guess this can be the one that does the adjusting for pegPrinter, to-ast and to-tast)

oof. Not working at runtime, huh.
because it's all toplevel definitions. I think I might need to make everything ... take a ... hmm ToTast as a fn? or just on Ctx?
