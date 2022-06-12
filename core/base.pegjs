{
    let allComments: Array<[IFileRange, string]> = [];
    let idx = 0;
    function myLocation(): IFileRange & {idx: number} {
        return {...location(), idx: idx++}
    }
}

File = _ toplevels:(Toplevel ';'? '\n')* _ finalLineComment? 

Toplevel = Expression

Expression = Apply

Apply = target:Atom parens_drop:Parens*

Atom = Int

Parens = "(" _ args:CommaExpr? ")"

CommaExpr = first:Expression rest:( _ "," _ Expression)* _ ","? _

Int "int" = _ contents:$("-"? [0-9]+) 

Identifier = text:$IdText hash:($JustSym / $HashRef)?

IdText "identifier" = ![0-9] [0-9a-z-A-Z_]+

JustSym = "#" ":" [0-9]+
HashRef = "#" [0-9a-zA-Z]+
HashNum = "#" [0-9]+
BuiltinHash = $("#" "builtin")

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