import { Selection, Store } from '../editor/store/store';
import { Path } from './react-map';

export const goRight = (
    store: Store,
    idx: number,
    path: Path[],
): null | Selection => {
    if (!path.length) {
        return null;
    }
    let last = path[path.length - 1];
    const node = store.map[last.idx].value;
    const children = nodeChildren(node);
    const at = children.findIndex((c) => c.item.cid === last.cid);
    if (at === -1) {
        console.warn('bad children in goRight', node, last, children);
        return null;
    }
    if (at < children.length - 1) {
        let next = children[at + 1];
        path = path.slice(0, -1).concat(next.item);
        while (next.idx != null) {
            const children = nodeChildren(store.map[next.idx].value);
            if (!children.length) {
                console.warn(
                    `no children in goRight`,
                    store.map[next.idx].value,
                );
                return null;
            }
            next = children[0];
            path.push(next.item);
        }
        return {
            type: 'edit',
            idx: next.item.idx,
            path,
            at: next.item.cid,
        };
    }
    return goRight(store, last.idx, path.slice(0, -1));
};

export const nodeChildren = (
    node: Store['map'][number]['value'],
): {
    item: Path;
    idx?: number;
}[] => {
    if (node.type === 'Apply') {
        const children = [];
        let idx = node.loc.idx;
        let cid = 0;
        children.push({ item: { cid: cid++, idx, punct: 0 } });
        node.suffixes.forEach((suffix) => {
            children.push({
                item: { cid: cid++, idx, punct: 0 },
                idx: suffix,
            });
        });
        return children;
    }
    if (node.type === 'CallSuffix') {
        const children = [];
        let idx = node.loc.idx;
        let cid = 0;
        let punct = 0;
        children.push({ item: { cid: cid++, idx: node.loc.idx, punct } });
        punct += 1;
        node.args.forEach((arg, i) => {
            children.push({ item: { cid: cid++, idx, punct }, idx: arg });
            if (i < node.args.length - 1) {
                punct += 2;
            }
        });
        if (!node.args.length) {
            children.push({ item: { cid: cid++, idx, punct } });
        }
        punct += 1;
        children.push({ item: { cid: cid++, idx: node.loc.idx, punct } });
        return children;
    }
    return [];
};
