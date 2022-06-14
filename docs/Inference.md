# Type Inference yes

so I think what I want to be able to do
is (a) represnet not-yet-resolved identifiers
(b) keep track of type variables somehow

where in the TAST do the Ts live?
Is it only at like a function declaration?
so like fn args know what types they are?
what about variable declarations?
seems like they have the capacity to constrain types
but then, what if they don't?
what if we actually don't declare types anywhere?
and it's just fully-typed terms that have types associated with them
and you can specify them as an afterthought.

buut I'm relying on knowing about types to know how to type
a given ambiguous identifier. but then again maybe I should lean
into the UI part of things.

Ok so what I'm imagining is: if we come across something that's ambiguous,
we just leave it ambiguous. Treat it as "unresolved". unless there's something
in the immediate environment to constrain it.

tbh I like that. We're not making arbitrary choices.

Ok, so we can have a node that represents the potentially unresolved
nature of an identifier, or an attribute fn, or even a FloatOrInt.

And then we go through, and try to resolve things down.
And anything that we can't resolve, we boot up to the user.
Does that mean I can do a straightforward hindley milner in here somewhere?
idk if HM allows for rank-N polymorphism, which I'm pretty sure I do.

butttt yeah I think that'll be a much more satisfying inference story?


isss there any use to having ... the ability to overload /Type/ names?
like, that seems like it would just be too confusing. Right?
Maybe I'll disallow it for the moment.



howw will I maintain a mapping from expressions to their types?
I'm shying away from denomalizing them onto the nodes themselves
but when I'm doing my unification, and .. after, during type generation,
I will need to know the types of things.
hm although again, I think I'll only need to keep track of the types
of local variables. global variables already have locked-down types.


http://lucacardelli.name/Papers/BasicTypechecking.pdf
https://ocw.mit.edu/courses/6-827-multithreaded-parallelism-languages-and-compilers-fall-2002/a981df4e1fd91ddf5cf7c1a15c5d1b03_L07HindleyMilner2Print.pdf
http://steshaw.org/hm/
https://legacy-blog.akgupta.ca/blog/2013/05/14/so-you-still-dont-understand-hindley-milner/
https://github.com/billpmurphy/hask/blob/master/hask/lang/hindley_milner.py
https://github.com/kevinbarabash/compiler/blob/main/src/infer/constraint-solver.ts
https://web.cecs.pdx.edu/~mpj/thih/TypingHaskellInHaskell.html
https://github.com/eignnx/hindley-milner/blob/master/hindley_milner/src/unifier_set.py
https://github.com/jfecher/algorithm-j/blob/master/j.ml
https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system#Algorithm_J
https://www.youtube.com/watch?v=8coUL8G1lFA
