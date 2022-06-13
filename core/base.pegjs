{
    let allComments = [];
    let idx = 0;
    function myLocation() {
        return {...location(), idx: idx++}
    }
}

File = _ toplevels:(Toplevel ';'? '\n')* _ finalLineComment? 

Toplevel = Expression

Expression = Apply

Apply = target:Atom suffixes_drop:Suffix*

Atom = Int / Identifier / Lambda / Parened / TypeLambda

// ParenedOp = "(" binopWithHash ")"

Parened = "(" _ Expression _ ")"

// oof ok, so using parentheses to distinguish + operators
// might run afoul of lambda syntax
Lambda = "(" _ params:Params? ")" _ "=>" _ body:Expression

Params = first:Param rest:(_ "," _ Param)* _ ","? _

TypeLambda = "<" _ params:CommaTypeParam ">" _ body:Expression

CommaTypeParam = first:TypeParam rest:(_ "," _ TypeParam)* _ ","? _

// TODO constraints I think
TypeParam = id:Identifier hash:JustSym?

// TODO allow type annotations probably
Param = Pattern

Pattern = id:Identifier hash:JustSym?

Suffix = Parens / TypeApplication

Parens = "(" _ args:CommaExpr? ")"

TypeApplication = "<" _ args:CommaType? ">"

CommaType = first:Type rest:(_ "," _ Type)* _ ","? _

Type = id:Identifier args:TypeApplication?

CommaExpr = first:Expression rest:( _ "," _ Expression)* _ ","? _

Int "int" = _ contents:$("-"? [0-9]+) 

Identifier = text:$IdText hash:($JustSym / $HashRef / $BuiltinHash)?

IdText "identifier" = ![0-9] [0-9a-z-A-Z_]+

JustSym = "#" ":" [0-9]+
HashRef = "#" [0-9a-zA-Z]+
HashNum = "#" [0-9]+
BuiltinHash = "#" ("builtin" / "b")

newline = "\n"
_nonnewline = [ \t\r]* (comment [ \t\r]*)*
_ "whitespace"
  = [ \t\n\r]* (comment _)*
__ "whitespace"
  = [ \t\n\r]+ (comment _)*
comment = multiLineComment / lineComment
multiLineComment = $("/*" (!"*/" .)* "*/")
lineComment = $("//" (!"\n" .)* "\n")
finalLineComment = $("//" (!"\n" .)*)