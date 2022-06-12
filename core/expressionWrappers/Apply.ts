// hm

/*:peg:

Apply = target:Encapsulated suffixes_drop:Suffix*

Suffix = Index
Index = "[" Expression "]"
Parens = "(" _ first:Expression rest:(_ "," _ @Expression)* _ ","? _ ")"

*/
