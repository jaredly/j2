{
    let allComments = [];
    let idx = 0;
    function myLocation() {
        return {...location(), idx: idx++}
    }
}

File = toplevels:(_ Toplevel _nonnewline ';'? _lineEnd)* _ finalLineComment? 

_lineEnd = '\n' / _EOF

_EOF = !.

// Declaration = name:$IdText _ type:Type

Toplevel = Expression

Expression = DecoratedExpression



Atom = Number / Boolean / Identifier / ParenedExpression / TemplateString

ParenedExpression = "(" _ expr:Expression _ ")"


Identifier = text:$IdText hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?

IdText "identifier" = ![0-9] [0-9a-z-A-Z_]+

JustSym = "#[" [0-9]+ "]"
HashRef = "#[h" [0-9a-zA-Z]+ "]"
BuiltinHash = "#[" ("builtin" / "b") "]"
UnresolvedHash = "#[" ":unresolved:" "]"

