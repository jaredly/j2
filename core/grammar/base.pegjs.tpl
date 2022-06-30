{
    let allComments = [];
    let idx = 0;
    function myLocation() {
        return {...location(), idx: idx++}
    }
}

File = toplevels:(_ Toplevel _nonnewline ';'? _lineEnd)* _ finalLineComment? 

// Declaration = name:$IdText _ type:Type





Atom = Number / Boolean / Identifier / ParenedExpression / TemplateString

ParenedExpression = "(" _ expr:Expression _ ")"


NamespacedIdText "identifier" = $IdText (":" IdText)*

JustSym = "#[" [0-9]+ "]"
HashRef = "#[h" [0-9a-zA-Z]+ "]"
ShortRef = "#[:" [0-9a-zA-Z]+ "]"
BuiltinHash = "#[" ("builtin" / "b") "]"
UnresolvedHash = "#[" ":unresolved:" "]"

