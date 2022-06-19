So, I want
to be able to define syntax elements
all at once.
but
how do I make sure that inference still works?

- defining grammars as a smattering, seems fine. I'll have my concat build job put them all into one file, and I'll be able to diagnose lint errors there
- defining ToTast and ToAst and ToPP. I guess it's just a matter of ... spreading them all into the same thing? ... seems fine. Inference should still work?

Yeah let's try that. Grammars last.

OH my transform generator will have to learn to follow imports.