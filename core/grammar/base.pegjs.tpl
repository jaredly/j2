{
    let allComments = [];
    let idx = 0;
    function myLocation() {
        return {...location(), idx: idx++}
    }
}

File = _ toplevels:(Toplevel _nonnewline ';'? _lineEnd)* _ finalLineComment? 

_lineEnd = '\n' / _EOF

_EOF = !.

// Declaration = name:$IdText _ type:Type

Toplevel = Expression

Expression = DecoratedExpression


DecType = ":" _ type_:Type 
// DecPat = "?" __ pattern:Pattern 
DecExpr = expr:Expression 

// Type = TRef / Number / String
// TRef = text:($IdText) hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?
Type = text:($IdText) hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?


Atom = Number / Boolean / Identifier / ParenedExpression / TemplateString

ParenedExpression = "(" _ expr:Expression _ ")"


Identifier = text:$IdText hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?

IdText "identifier" = ![0-9] [0-9a-z-A-Z_]+

JustSym = "#[" [0-9]+ "]"
HashRef = "#[h" [0-9a-zA-Z]+ "]"
BuiltinHash = "#[" ("builtin" / "b") "]"
UnresolvedHash = "#[" ":unresolved:" "]"

newline = "\n"
_nonnewline = [ \t\r]* (comment [ \t\r]*)*
_ "whitespace"
  = [ \t\n\r]* (comment _)*
__ "whitespace"
  = [ \t\n\r]+ (comment _)*
comment = multiLineComment / lineComment
multiLineComment = $("/*" (!"*/" .)* "*/")
lineComment = $("//" (!"\n" .)* &"\n")
finalLineComment = $("//" (!"\n" .)*)
