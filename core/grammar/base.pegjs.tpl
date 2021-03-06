{
    let allComments = [];
    let idx = 0;
    function myLocation() {
        return {...location(), idx: idx++}
    }
}

File = toplevels:(_ Toplevel _nonnewline ';'? _lineEnd)* _ finalLineComment? 
TypeFile = toplevels:(_ TypeToplevel _nonnewline ';'? _lineEnd)* _ finalLineComment? 

// Declaration = name:$IdText _ type:Type

NamespacedIdText "identifier" = $IdText (":" IdText)*

JustSym = "#[" [0-9]+ "]"
RecurHash = "#[r" [0-9]+ "]"
HashRef = "#[" HashRefInner "]"
HashRefInner = "h" [0-9a-zA-Z]+ 
ShortRef = "#[:" [0-9a-zA-Z]+ "]"
BuiltinHash = "#[" ("builtin" / "b") "]"
UnresolvedHash = "#[" ":unresolved:" "]"
