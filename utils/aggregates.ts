// FUTURE WORK
// - recognize that `is`, `location`, and `decorators` are common to all `Term`s,
//   and so they can be done at the top level of `transformTerm`, instead of in every branch.

import * as fs from 'fs';
import { Ctx, getUnionNames } from './build-transform';
import { collectTypes } from './collect-types';

const getAllUnions = (types: Ctx['types']) => {
    const res: { [key: string]: string[] } = {};
    Object.keys(types).forEach((type) => {
        let t = types[type];
        if (
            t.type.type === 'TSTypeReference' &&
            t.type.typeName.type === 'Identifier'
        ) {
            t = types[t.type.typeName.name];
            console.log('ok', type);
        }
        if (t.type.type === 'TSUnionType') {
            const names = getUnionNames(t.type, types);
            if (!names.includes(type)) {
                res[type] = names;
            }
        }
    });
    return res;
};

const parserTypes = collectTypes('./core/grammar/base.parser.ts', false);
const tastTypes = collectTypes('./core/typed-ast.ts', true);
// console.log(tastTypes.Expression);

const parserUnions = getAllUnions(parserTypes);
const tastUnions = getAllUnions(tastTypes);

const Parser: { [key: string]: string | false } = {
    EnumCase: false,
    Suffix: 'Expression',
    Atom: false,
    Toplevel: false,
};

const Taster: { [key: string]: string | false } = {
    RefKind: false,
    PPath: false,
    VError: false,
};

const keys = Object.keys(parserUnions).filter(
    (x) => Parser[x] !== false && (tastTypes[x] || !!Parser[x]),
);
// console.log(Object.keys(parserUnions), keys);
// console.log(Object.keys(tastTypes));

const extraArgs: { [key: string]: string } = {
    Suffix: ' next: t.Expression,',
    // Pattern: ' expected: t.Type | null,',
};
const extraPass: { [key: string]: string } = {
    Suffix: ' next,',
    // Pattern: ' expected,',
};

const jsTypes: { [key: string]: false | string } = {
    IStmt: false, // 'Statement',
    IExpression: 'Expression',
};

const IStart = /^I[A-Z]/;

const text = `
import { Visitor } from '../transform-tast';
import { decorate } from '../typing/analyze';
import { Ctx as ACtx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TMCtx } from '../typing/typeMatches';
import { Ctx as JCtx } from '../ir/to-js';
import { Ctx as ICtx } from '../ir/ir';
import * as b from '@babel/types';


export const ToTast = {
	${keys
        .map((type) => {
            return `
		${type}(node: p.${type},${extraArgs[type] || ''} ctx: TCtx): t.${
                Parser[type] || type
            } {
			switch (node.type) {
				${parserUnions[type]
                    .map((union) => {
                        return `
					case '${union}':
						return ctx.ToTast.${union}(node,${extraPass[type] || ''} ctx);
					`;
                    })
                    .join('\n')}
				default:
					let _: never = node;
					throw new Error('Nope');
			}
		},
		`;
        })
        .join('\n')}
}

export const ToAst = {
	${Object.keys(tastUnions)
        .filter((n) => !n.match(IStart) && Taster[n] !== false)
        .map((type) => {
            return `
		${type}(node: t.${type}, ctx: TACtx): p.${type} {
			switch (node.type) {
				${tastUnions[type]
                    .map((union) => {
                        return `
					case '${union}':
						return ctx.ToAst.${union}(node, ctx);
					`;
                    })
                    .join('\n')}
				default:
					let _: never = node;
					throw new Error('Nope');
			}
		},
		`;
        })
        .join('\n')}
}

export const ToPP = {
	${keys
        .map((type) => {
            return `
		${type}(node: p.${type}, ctx: PCtx): pp.PP {
			switch (node.type) {
				${parserUnions[type]
                    .map((union) => {
                        return `
					case '${union}':
						return ctx.ToPP.${union}(node, ctx);
					`;
                    })
                    .join('\n')}
				default:
					let _: never = node;
					throw new Error('Nope');
			}
		},
		`;
        })
        .join('\n')}
}

export const ToIR = {
	${Object.keys(tastUnions)
        .filter(
            (n) =>
                !n.match(IStart) && // && Taster[n] !== false
                tastTypes['I' + n],
        )
        .map((type) => {
            return `
		${type}(node: t.${type}, ctx: ICtx): t.I${type} {
			switch (node.type) {
				${tastUnions[type]
                    .map((union) => {
                        return `
					case '${union}':
						return ctx.ToIR.${union}(node, ctx);
					`;
                    })
                    .join('\n')}
				default:
					let _: never = node;
					throw new Error('Nope');
			}
		},
		`;
        })
        .join('\n')}
}

export const ToJS = {
	${Object.keys(tastUnions)
        .filter((n) => n.match(IStart) && jsTypes[n] !== false)
        .map((type) => {
            return `
		${type}(node: t.${type}, ctx: JCtx): b.${jsTypes[type]} {
			switch (node.type) {
				${tastUnions[type]
                    .map((union) => {
                        return `
					case '${union}':
						return ctx.ToJS.${union}(node, ctx);
					`;
                    })
                    .join('\n')}
				default:
					let _: never = node;
					throw new Error('Nope');
			}
		},
		`;
        })
        .join('\n')}

}


`;

fs.writeFileSync('./core/elements/macros.ts', text);

// const config = {
// 	ToTast: {
// 		Expression:
// 	}
// }

// const inFile = './core/typed-ast.ts';
// const [_, __, inFile, outFile] = process.argv;

// let text =
//     buildTransformFile(
//         body,
//         path
//             .relative(path.dirname(outFile), inFile)
//             .replace(/\.ts$/, '')
//             .replace(/^(?=[^.])/, './'),
//         ctx,
//     ) +
//     '\n' +
//     generateCheckers(ctx, []);

// fs.writeFileSync(outFile, text);
