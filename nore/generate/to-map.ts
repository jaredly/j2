import {
    change,
    check,
    Derived,
    EExtra,
    Gram,
    Grams,
    TGram,
    TopGram,
    transform,
    transformGram,
} from '../grams/types';
import * as b from '@babel/types';
import generate from '@babel/generator';

// Gotta generate the equivalent of to-map.ts

// export const generateTypes = (
//     grammar: Grams,
//     lines: { name: string; defn: b.TSType }[],
// ) => {
//     const map: { [key: string]: b.TSType } = {};
//     lines.forEach(({ name, defn }) => {
//         map[name] = defn;
//     });
//     const fns: string[] = [];

// 	lines.forEach(({name, defn}) => {
// 		if (defn.type === 'TSStringKeyword') {
// 			return
// 		}

// 	})
// };
