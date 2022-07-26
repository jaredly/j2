import { noloc } from '../core/ctx';
import { Loc } from '../core/typed-ast';
import { Colorable } from './Highlight';
import { HL } from './HL';

export type MarkupLoc = HL;

export const markUpTree = (text: string, locs: Array<MarkupLoc>): Tree => {
    const points = sortLocs(locs);
    let pos = 0;
    let top: Tree = {
        type: 'tree',
        children: [],
        hl: { type: 'File', loc: noloc },
    };
    let stack: Tree[] = [top];
    points.forEach(({ at, starts, ends }) => {
        if (at > pos && stack.length) {
            stack[0].children.push({
                type: 'leaf',
                text: text.slice(pos, at),
                span: [pos, at],
            });
        }
        ends.forEach(() => {
            stack.shift();
        });
        if (stack.length) {
            starts.forEach(({ hl }) => {
                const next: Tree = { type: 'tree', children: [], hl };
                stack[0].children.push(next);
                stack.unshift(next);
            });
        }

        pos = at;
    });
    return top;
};

export type Tree = { type: 'tree'; hl: HL; children: (Tree | Leaf)[] };
export type Leaf = { type: 'leaf'; span: [number, number]; text: string };

export function sortLocs(locs: HL[]) {
    let points: {
        at: number;
        starts: { hl: HL; size: number }[];
        ends: { hl: HL; size: number }[];
    }[] = [];
    locs.forEach((hl) => {
        const { loc } = hl;
        const size = loc.end.offset - loc.start.offset;
        let sp =
            points[loc.start.offset] ??
            (points[loc.start.offset] = {
                starts: [],
                ends: [],
                at: loc.start.offset,
            });
        sp.starts.push({ hl, size });
        let ep =
            points[loc.end.offset] ??
            (points[loc.end.offset] = {
                starts: [],
                ends: [],
                at: loc.end.offset,
            });
        ep.ends.push({ hl, size });
    });
    points.forEach(({ starts, ends }) => {
        starts.sort((a, b) => b.size - a.size); // starts bigggest first
        ends.sort((a, b) => a.size - b.size);
    });
    return points;
}
