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
NamespacedIdText "identifier" = $IdText (":" IdText)*

JustSym = "#[" [0-9]+ "]"
HashRef = "#[h" [0-9a-zA-Z]+ "]"
BuiltinHash = "#[" ("builtin" / "b") "]"
UnresolvedHash = "#[" ":unresolved:" "]"



// apply.ts

Apply = target:Atom suffixes_drop:Suffix*
Suffix = Parens
Parens = "(" _ args:CommaExpr? ")"
CommaExpr = first:Expression rest:( _ "," _ Expression)* _ ","? _


// comments.ts

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


// constants.ts

Boolean "boolean" = v:("true" / "false") ![0-9a-zA-Z_]
Number "number" = _ contents:$("-"? [0-9]+ ("." [0-9]+)?)

String = "\"" text:$(stringChar*) "\""
TemplateString = "\"" first:$tplStringChars rest:TemplatePair* "\""
TemplatePair = wrap:TemplateWrap suffix:$tplStringChars
TemplateWrap = "\${" _ expr:Expression _ "}"
tplStringChars = $(!"\${" stringChar)*
stringChar = $( escapedChar / [^"\\])
escapedChar = "\\" .


// decorators.ts

DecoratedExpression = decorators_drop:(Decorator _)* inner:Apply

Decorator = '@' id:DecoratorId _ '(' _ args:DecoratorArgs? _ ')'
DecoratorId = text:$NamespacedIdText hash:($HashRef / $UnresolvedHash)?
DecoratorArgs = first:LabeledDecoratorArg rest:(_ "," _ LabeledDecoratorArg)* _ ","? 
DecoratorArg = DecType / DecExpr
// DecoratorArg = DecType / DecPat / DecExpr
LabeledDecoratorArg = label:($IdText ":" _)? arg:DecoratorArg 

DecType = ":" _ type_:Type 
// DecPat = "?" __ pattern:Pattern 
DecExpr = expr:Expression 


// type.ts

Type = TRef / Number / String / TLambda / TVars
TRef = text:($IdText) hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?
TVars = "<" _ args:TBargs _ ">" inner:Type
TBargs = first:TBArg rest:(_ "," _ TBArg)* _ ","?
TBArg = label:$IdText hash:$JustSym? bound:(_ ":" _ Type)?

TArg = label:($IdText _ ":" _)? typ:Type
TArgs = first:TArg rest:( _ "," _ TArg)* _ ","? _
TLambda = "(" _ args:TArgs? ")" _ "=>" _ result:Type