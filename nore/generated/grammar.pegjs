Number = num:(RawNumber) kind:("u" / "i" / "f")? {
            return { type: 'Number', num: {
                raw: num,
                value: ((raw2) => +raw2)(num)
            }, kind: kind ? {inferred: false, value: kind} : {inferred: true, value: undefined}, loc: range() }
        }

RawNumber = $("-"? [0-9]+)

Boolean = value:("true" / "false") {
            return { type: 'Boolean', value: value, loc: range() }
        }

Identifier = text:IdText ref:(IdHash / LocalHash)? {
            return { type: 'Identifier', text: text, ref: ref ? {inferred: false, value: ref} : {inferred: true, value: undefined}, loc: range() }
        }

IdText = $(![0-9] [0-9a-zA-Z_]+)

HashText = $([0-9a-zA-Z]+)

UIntLiteral = $([0-9]+)

UInt = UIntLiteral {
                return {
                    type: 'UInt',
                    raw: text(),
                    value: ((raw2) => parseInt(raw2))(text()),
                    loc: range(),
                }
            }

LocalHash = "#[:" sym:UInt "]" {
            return { type: 'LocalHash', sym: sym, loc: range() }
        }

IdHash = "#[h" hash:HashText idx:("." UInt)? "]" {
            return { type: 'IdHash', hash: hash, idx: idx ? idx[1] : null, loc: range() }
        }

CallSuffix = args:(("(" first:Expression? _ rest:(_ ',' _ @Expression)* _ ','? _  ")"
            { return [
                ...first ? [first] : [],
                ...rest,
            ]}
            )) {
            return { type: 'CallSuffix', args: args, loc: range() }
        }

Apply = target:Applyable suffixes:Suffix* {
            if (!suffixes.length) {
                return target
            }
            return {type: 'Apply', target, suffixes, loc: range()}
        }

_ = $([ \t\n\r]*)

Applyable = Number / Boolean / Identifier

Type = Number / Boolean / Identifier

Suffix = CallSuffix

Expression = Apply