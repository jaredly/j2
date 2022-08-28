Number = num:(RawNumber) kind:("u" / "i" / "f")? {
            return { type: 'Number', num: {
                raw: num,
                value: ((raw2) => +raw2)(num)
            }, kind: kind ? {inferred: false, value: kind} : {inferred: true, value: undefined} }
        }

RawNumber = [0-9]+ { return text() }

Boolean = value:("true" / "false") {
            return { type: 'Boolean', value: value }
        }

Identifier = text:IdText ref:(IdHash / LocalHash)? {
            return { type: 'Identifier', text: text, ref: ref ? {inferred: false, value: ref} : {inferred: true, value: undefined} }
        }

IdText = ![0-9] [0-9a-zA-Z_]+ { return text() }

HashText = "h" [0-9a-zA-Z]+ { return text() }

UIntLiteral = [0-9]+ { return text() }

LocalHash = "#[:" sym:(UIntLiteral) "]" {
            return { type: 'LocalHash', sym: {
                raw: sym,
                value: ((raw2) => parseInt(raw2))(sym)
            } }
        }

IdHash = "#[" hash:HashText idx:("." UIntLiteral)? "]" {
            return { type: 'IdHash', hash: hash, idx: idx ? {
                raw: idx[1],
                value: ((raw2) => parseInt(raw2))(idx[1])
            } : null }
        }

CallSuffix = args:("(" Expression? _ (_ ',' _ Expression)* _ ','? _  ")") {
            return { type: 'CallSuffix', args: [
                ...(args[1] ? [args[1]] : []),
                ...(args[3].map(item => item[3])),
            ] }
        }

Apply = target:Applyable suffixes:Suffix* {
            if (!suffixes.length) {
                return target
            }
            return {type: 'Apply', target, suffixes}
        }

_ = [ \t\n\r]* { return text() }

Applyable = Number / Boolean / Identifier

Type = Number / Boolean / Identifier

Suffix = CallSuffix

Expression = Apply