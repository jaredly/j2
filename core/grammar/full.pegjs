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
HashRef = "#[h" [0-9a-zA-Z]+ "]"
ShortRef = "#[:" [0-9a-zA-Z]+ "]"
BuiltinHash = "#[" ("builtin" / "b") "]"
UnresolvedHash = "#[" ":unresolved:" "]"


// apply.ts

Apply = target:Atom suffixes_drop:Suffix*
Suffix = CallSuffix / TypeApplicationSuffix
CallSuffix = "(" _ args:CommaExpr? ")"
CommaExpr = first:Expression rest:( _ "," _ Expression)* _ ","? _


// base.ts



_lineEnd = '\n' / _EOF

_EOF = !.

Toplevel = TypeAlias / Expression
TypeToplevel = TypeAlias / Type

Expression = DecoratedExpression

Identifier = text:$IdText hash:($JustSym / $HashRef / $RecurHash / $ShortRef / $BuiltinHash / $UnresolvedHash)?

Atom = Number / Boolean / Identifier / ParenedExpression / TemplateString / Enum / Record

ParenedExpression = "(" _ items:CommaExpr? _ ")"

IdText "identifier" = ![0-9] [0-9a-z-A-Z_]+
AttrText "attribute" = $([0-9a-z-A-Z_]+)



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
Number "number" = _ contents:$("-"? [0-9]+ ("." [0-9]+)? "u"?)

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


// enum-exprs.ts

Enum = "\`" text:$IdText payload:("(" _ CommaExpr? _ ")")?


// enums.ts

TEnum = "[" _ cases:EnumCases? _ "]"
EnumCases = first:EnumCase rest:( _ "|" _ EnumCase)* _ "|"?
EnumCase = TagDecl / Type / Star
TagDecl = decorators:(Decorator _)* "\`" text:$IdText payload:TagPayload?
// add '/ Record' here?
TagPayload = "(" _ first:Type rest:(_ "," _ Type)* _ ","? _ ")"
Star = pseudo:"*"



// generics.ts

TypeApplicationSuffix = "<" _ vbls:TypeAppVbls ">"
TypeAppVbls = first:Type rest:( _ "," _ Type)* _ ","? _

TypeVariables = "<" _ vbls:TypeVbls ">" _ body:Expression
TypeVbls = first:TypeVbl rest:( _ "," _ TypeVbl)* _ ","? _
TypeVbl = vbl:Identifier bound:(_ ":" _ Type)?


// record-exprs.ts

Record = "{" _ items:RecordItems? _ "}"
RecordItems = first:RecordItem rest:(_ "," _ RecordItem)* _ ","?
RecordItem = RecordSpread / RecordKeyValue
RecordSpread = "..." _ inner:Expression
RecordKeyValue = key:$AttrText _ ":" _ value:Expression


// records.ts

TRecord = "{" _ items:TRecordItems? _ "}"
TRecordItems = first:TRecordItem rest:(_ "," _ TRecordItem)* _ ","?
TRecordItem = TRecordSpread / TRecordKeyValue / Star
TRecordSpread = "..." _ inner:Type
TRecordKeyValue = key:$AttrText _ ":" _ value:Type



// type-vbls.ts

TApply = inner:TAtom args_drop:(_ "<" _ TComma _ ">")*
TComma = first:Type rest:(_ "," _ Type)* _ ","?

TVars = "<" _ args:TBargs _ ">" inner:Type
TBargs = first:TBArg rest:(_ "," _ TBArg)* _ ","?
TBArg = label:$IdText hash:$JustSym? bound:(_ ":" _ Type)? default_:(_ "=" _ Type)?


// type.ts

Type = TOps
TDecorated = decorators:(Decorator _)+ inner:TApply

TAtom = TRef / Number / String / TLambda / TVars / TParens / TEnum / TRecord
TRef = text:($IdText) hash:($JustSym / $HashRef / $RecurHash / $BuiltinHash / $UnresolvedHash)?

TOps = left:TOpInner right_drop:TRight*
TRight = _ top:$top _ right:TOpInner
top = "-" / "+"
TOpInner = TDecorated / TApply

TParens = "(" _ items:TComma? _ ")"

TArg = label:($IdText _ ":" _)? typ:Type
TArgs = first:TArg rest:( _ "," _ TArg)* _ ","? _
TLambda = "(" _ args:TArgs? ")" _ "=>" _ result:Type

TypeAlias = "type" _ first:TypePair rest:(_ "and" _ TypePair)*
TypePair = name:$IdText _ "=" _ typ:Type
