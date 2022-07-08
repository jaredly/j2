import { Loc } from '../core/typed-ast';
import { Colorable } from './Highlight';

export const markUpTree = (
    text: string,
    locs: Array<{ loc: Loc; type: Colorable }>,
): Tree => {
    const points = sortLocs(locs);
    let pos = 0;
    let top: Tree = { type: 'tree', children: [], kind: 'File' };
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
            starts.forEach(({ type }) => {
                const next: Tree = { type: 'tree', children: [], kind: type };
                stack[0].children.push(next);
                stack.unshift(next);
            });
        }

        pos = at;
    });
    return top;
};

export type Tree = { type: 'tree'; kind: Colorable; children: (Tree | Leaf)[] };
export type Leaf = { type: 'leaf'; span: [number, number]; text: string };

export function sortLocs(locs: { loc: Loc; type: Colorable }[]) {
    let points: {
        at: number;
        starts: { type: Colorable; size: number }[];
        ends: { type: Colorable; size: number }[];
    }[] = [];
    locs.forEach(({ loc, type }) => {
        const size = loc.end.offset - loc.start.offset;
        let sp =
            points[loc.start.offset] ??
            (points[loc.start.offset] = {
                starts: [],
                ends: [],
                at: loc.start.offset,
            });
        sp.starts.push({ type, size });
        let ep =
            points[loc.end.offset] ??
            (points[loc.end.offset] = {
                starts: [],
                ends: [],
                at: loc.end.offset,
            });
        ep.ends.push({ type, size });
    });
    points.forEach(({ starts, ends }) => {
        starts.sort((a, b) => b.size - a.size); // starts bigggest first
        ends.sort((a, b) => a.size - b.size);
    });
    return points;
}
