
    {{
        export let idx = {current: 0};
    }}

    {
        function loc() {
            return {...range(), idx: idx.current++}
        }
    }
    Lambda = "fn" _ args:(("(" first:Larg? _ rest:(_ ',' _ @Larg)* _ ','? _  ")"
            { return [
                ...first ? [first] : [],
                ...rest,
            ]}
            )) _ res:(":" _ @Type)? _ "=>" _ body:Expression {
            return { type: 'Lambda', args: args, res: res ? {inferred: false, value: res} : null, body: body, loc: loc() }
        }

Larg = pat:Pattern _ typ:(":" _ @Type)? {
            return { type: 'Larg', pat: pat, typ: typ ? {inferred: false, value: typ} : null, loc: loc() }
        }

Number = num:(RawNumber) _ kind:("u" / "i" / "f")? {
            return { type: 'Number', num: {
                raw: num,
                value: ((raw) => +raw)(num)
            }, kind: kind ? {inferred: false, value: kind} : null, loc: loc() }
        }

RawNumber = $("-"? [0-9]+ ("." [0-9]+)?)

Boolean = value:("true" / "false") {
            return { type: 'Boolean', value: value, loc: loc() }
        }

PIdentifier = text:IdText _ ref:(LocalHash)? {
            return { type: 'PIdentifier', text: text, ref: ref ? {inferred: false, value: ref} : null, loc: loc() }
        }

Identifier = text:IdText _ ref:(IdHash / LocalHash)? {
            return { type: 'Identifier', text: text, ref: ref ? {inferred: false, value: ref} : null, loc: loc() }
        }

IdText = $(![0-9] [0-9a-zA-Z_]+)

HashText = $([0-9a-zA-Z]+)

UIntLiteral = $([0-9]+)

UInt = UIntLiteral {
                return {
                    type: 'UInt',
                    raw: text(),
                    value: ((raw) => parseInt(raw))(text()),
                    loc: loc(),
                }
            }

LocalHash = "#[:" _ sym:UInt _ "]" {
            return { type: 'LocalHash', sym: sym, loc: loc() }
        }

IdHash = "#[h" _ hash:HashText _ idx:("." _ @UInt)? _ "]" {
            return { type: 'IdHash', hash: hash, idx: idx ? idx[1] : null, loc: loc() }
        }

Apply = target:Applyable suffixes:Suffix* {
            if (!suffixes.length) {
                return target
            }
            return {type: 'Apply', target, suffixes, loc: loc()}
        }

CallSuffix = args:(("(" first:Expression? _ rest:(_ ',' _ @Expression)* _ ','? _  ")"
            { return [
                ...first ? [first] : [],
                ...rest,
            ]}
            )) {
            return { type: 'CallSuffix', args: args, loc: loc() }
        }

_ = $([ \t\n\r]*)

Expression = Lambda / Apply

Applyable = Number / Boolean / Identifier

Type = Number / Boolean / Identifier

Atom = Number / Boolean / PIdentifier / Identifier

Pattern = PIdentifier

Suffix = CallSuffix