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

DecoratedExpression = decorators_drop:(Decorator _)* inner:Apply

Decorator = '@' id:DecoratorId _ '(' _ args:DecoratorArgs? _ ')'
DecoratorId = text:$IdText hash:($HashRef / $UnresolvedHash)?
DecoratorArgs = first:LabeledDecoratorArg rest:(_ "," _ LabeledDecoratorArg)* _ ","? 
DecoratorArg = DecType / DecExpr
// DecoratorArg = DecType / DecPat / DecExpr
LabeledDecoratorArg = label:($IdText ":" _)? arg:DecoratorArg 

DecType = ":" _ type_:Type 
// DecPat = "?" __ pattern:Pattern 
DecExpr = expr:Expression 

// Type = TRef / Number / String
// TRef = text:($IdText) hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?
Type = text:($IdText) hash:($JustSym / $HashRef / $BuiltinHash / $UnresolvedHash)?

Apply = target:Atom suffixes_drop:Suffix*

Atom = Number / Boolean / Identifier / ParenedExpression / TemplateString

ParenedExpression = "(" _ expr:Expression _ ")"

Suffix = Parens

Parens = "(" _ args:CommaExpr? ")"

CommaExpr = first:Expression rest:( _ "," _ Expression)* _ ","? _

Boolean "boolean" = v:("true" / "false") ![0-9a-zA-Z_]
Number "number" = _ contents:$("-"? [0-9]+ ("." [0-9]+)?)

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


// ----------

String = "\"" text:$(stringChar*) "\""
TemplateString = "\"" first:$tplStringChars rest:TemplatePair* "\""
TemplatePair = "${" _ expr:Expression _ "}" suffix:$tplStringChars
tplStringChars = $(!"${" stringChar)*
stringChar = $( escapedChar / [^"\\])
escapedChar = "\\" .

// TemplateString = "\"" contents:StringContents* "\""
// StringContents = TemplatePart / stringChar
// TemplatePart = "${" _ inner:Expression _ "}"
// stringChar = $( escapedChar / [^"\\])
// escapedChar = "\\" .
