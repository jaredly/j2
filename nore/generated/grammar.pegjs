Number = raw:RawNumber kind:("u" / "i" / "f")?

RawNumber = [0-9]+

Boolean = value:("true" / "false")

Identifier = text:IdText ref:(IdHash / LocalHash)?

IdText = ![0-9] [0-9a-zA-Z_]+

HashText = "h" [0-9a-zA-Z]+

LocalHash = "#[:" text:UIntLiteral "]"

IdHash = "#[" hash:HashText idx:("." UIntLiteral)? "]"

CallSuffix = args:("(" _ items:(Expression _ ',' _)* _ ',' _  ")")

Apply = target:Applyable suffixes:Suffix+

_ = [ \t\n\r]*

Applyable = Number / Boolean / Identifier

Type = Number / Boolean / Identifier

Suffix = CallSuffix

Expression = Apply

UIntLiteral = [0-9]+ { return +text() }