{
    let allComments: Array<[IFileRange, string]> = [];
    let idx = 0;
    function myLocation(): IFileRange & {idx: number} {
        return {...location(), idx: idx++}
    }
}

File = _ Expression _ finalLineComment? 

// BinOpInner = WithUnary
// // Oh maybe a Decorator is just another unary op?
// WithUnary = op_drop:UnaryOpWithHash? inner:UnaryInner 
// UnaryOpWithHash = op:UnaryOp hash:(OpHash _)?
// UnaryOp = "-" / "!"

// UnaryInner = WithSuffix
// UnaryInner = WithSuffix
// WithSuffix = target:SuffixInner suffixes_drop:Suffix*
// Suffix = ApplySuffix / AttributeSuffix / IndexSuffix / AsSuffix

// SuffixInner = Literal

/*
a binop could be #builtin
or
#:local#type#2 (idx within the type)
#global#type#3
hmm could 'type' be a local as well? maybeee
*/

// binopWithHash = op:binop hash:($BuiltinHash / $binopHash)?
// binop = $(!"//" [+*^/<>=|&-]+)
// binopHash = (JustSym / HashRef) (JustSym / HashRef) HashNum

// IdHash = $SymHash / $OpHash / $BuiltinHash
// SymHash = $JustSym $OpHash?
// OpHash = $HashRef+
JustSym = "#" ":" [0-9]+
HashRef = ("#" [0-9a-zA-Z]+)
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