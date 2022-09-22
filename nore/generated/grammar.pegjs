
    {{
        export let idx = {current: 0};
    }}

    {
        function loc() {
            return {...range(), idx: idx.current++}
        }
    }
    Number = num:(RawNumber) kind:("u" / "i" / "f")? {
            return { type: 'Number', num: {
                raw: num,
                value: ((raw) => +raw)(num)
            }, kind: kind ? {inferred: false, value: kind} : null, loc: loc() }
        }

RawNumber = $("-"? [0-9]+ ("." [0-9]+)?)

Boolean = value:("true" / "false") {
            return { type: 'Boolean', value: value, loc: loc() }
        }

Identifier = text:IdText ref:(IdHash / LocalHash)? {
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

LocalHash = "#[:" sym:UInt "]" {
            return { type: 'LocalHash', sym: sym, loc: loc() }
        }

IdHash = "#[h" hash:HashText idx:("." UInt)? "]" {
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

Applyable = Number / Boolean / Identifier

Type = Number / Boolean / Identifier

Expression = Apply

Suffix = CallSuffix