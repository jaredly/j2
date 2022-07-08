import { Loc } from '../core/typed-ast';

export const markUpTree = (
    text: string,
    locs: Array<{ loc: Loc; type: string }>,
): Tree => {
    const points = sortLocs(locs);
    let pos = 0;
    let top: Tree = { type: 'tree', children: [], kind: '' };
    let stack: Tree[] = [top];
    points.forEach(({ at, starts, ends }) => {
        if (at > pos) {
            stack[0].children.push({
                type: 'leaf',
                text: text.slice(pos, at),
                span: [pos, at],
            });
        }
        ends.forEach(() => {
            stack.shift();
        });
        starts.forEach(({ type }) => {
            const next: Tree = { type: 'tree', children: [], kind: type };
            stack[0].children.push(next);
            stack.unshift(next);
        });

        pos = at;
    });
    return top;
};

export type Tree = { type: 'tree'; kind: string; children: (Tree | Leaf)[] };
export type Leaf = { type: 'leaf'; span: [number, number]; text: string };

export function sortLocs(locs: { loc: Loc; type: string }[]) {
    let points: {
        at: number;
        starts: { type: string; size: number }[];
        ends: { type: string; size: number }[];
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
