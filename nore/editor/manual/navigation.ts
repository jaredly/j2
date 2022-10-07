import { Selection, Store } from '../store/store';
import { NodeChildren, Path } from '../generated/react-map';

type Nav = { sel: Selection; path: Path[] };

export const goLeft = (
    store: Store,
    path: Path[],
    needPunct = true,
): null | Nav => {
    if (!path.length) {
        console.log('done path');
        return null;
    }
    const last = path[path.length - 1];
    // console.log(` > Left of`, last);
    const siblings = NodeChildren(store.map[last.idx].value);
    if (
        siblings[last.cid] == null ||
        siblings[last.cid].item.cid !== last.cid
    ) {
        console.error(`WAIT cid is off`, siblings, last);
        return null;
    }
    let punct = last.punct;
    let next = last.cid - 1;
    while (next >= 0) {
        const child = siblings[next];
        // console.log(`Next`, next, child, punct, child.item.punct);
        if (child.item.punct < punct) {
            needPunct = false;
        }
        if (child.idx != null) {
            const got = lastChild(
                store,
                child.idx,
                path.slice(0, -1).concat([child.item]),
                needPunct,
            );
            if (got) {
                return got;
            }
        }
        if (needPunct) {
            next--;
            continue;
        }
        if (next > 0 && siblings[next - 1].item.punct === punct) {
            next--;
            continue;
        }
        return {
            path: path.slice(0, -1),
            sel: {
                type: 'edit',
                idx: child.item.idx,
                cid: child.item.cid,
                at: 'end',
            },
        };
    }
    return goLeft(store, path.slice(0, -1), needPunct && punct === 0);
};

export const goRight = (
    store: Store,
    path: Path[],
    needPunct = true,
): null | Nav => {
    if (!path.length) {
        console.log('done path');
        return null;
    }
    const last = path[path.length - 1];
    const siblings = NodeChildren(store.map[last.idx].value);
    if (
        siblings[last.cid] == null ||
        siblings[last.cid].item.cid !== last.cid
    ) {
        console.error(`WAIT cid is off`, siblings, last);
        return null;
    }
    let punct = last.punct;
    let next = last.cid + 1;
    while (next < siblings.length) {
        const child = siblings[next];
        if (child.item.punct > punct) {
            needPunct = false;
        }
        if (child.idx != null) {
            const got = firstChild(
                store,
                child.idx,
                path.slice(0, -1).concat([child.item]),
                needPunct,
            );
            if (got) {
                return got;
            }
        }
        if (needPunct) {
            next++;
            continue;
        }
        return {
            path: path.slice(0, -1),
            sel: {
                type: 'edit',
                idx: child.item.idx,
                cid: child.item.cid,
                at: 'start',
            },
        };
    }
    return goRight(store, path.slice(0, -1), needPunct);
};

export const firstChild = (
    store: Store,
    idx: number,
    path: Path[],
    needPunct = false,
): null | Nav => {
    const children = NodeChildren(store.map[idx].value);
    if (!children.length) {
        return null;
    }
    let first = children[0];
    if (needPunct) {
        let found = null;
        for (let i = 0; i < children.length; i++) {
            if (children[i].item.punct) {
                found = children[i];
                break;
            }
        }
        if (found == null) {
            return null;
        }
        first = found;
    }
    if (first.idx != null) {
        return firstChild(store, first.idx, path.concat([first.item]));
    }
    return {
        path,
        sel: {
            type: 'edit',
            idx: first.item.idx,
            cid: first.item.cid,
            at: 'start',
        },
    };
};

export const lastChild = (
    store: Store,
    idx: number,
    path: Path[],
    needPunct = false,
): null | Nav => {
    const children = NodeChildren(store.map[idx].value);
    if (!children.length) {
        return null;
    }
    let last = children[children.length - 1];
    if (last.idx != null) {
        return lastChild(store, last.idx, path.concat([last.item]), needPunct);
    }
    let i = children.length - 1;
    while (
        !last.idx &&
        i > 0 &&
        children[i - 1].item.punct === last.item.punct
    ) {
        i--;
        last = children[i];
    }
    if (last.idx != null) {
        return lastChild(store, last.idx, path.concat([last.item]), needPunct);
    }
    if (needPunct) {
        let found = null;
        for (let i = children.length - 1; i >= 0; i--) {
            if (children[i].item.punct < last.item.punct) {
                found = children[i];
                break;
            }
        }
        if (found == null) {
            return null;
        }
        last = found;
    }
    if (last.idx != null) {
        return lastChild(store, last.idx, path.concat([last.item]), false);
    }
    return {
        path,
        sel: {
            type: 'edit',
            idx: last.item.idx,
            cid: last.item.cid,
            at: 'end',
        },
    };
};

// export const _goRight = (
//     store: Store,
//     idx: number,
//     path: Path[],
// ): null | Selection => {
//     if (!path.length) {
//         return null;
//     }
//     let last = path[path.length - 1];
//     const node = store.map[last.idx].value;
//     const children = nodeChildren(node);
//     const at = children.findIndex((c) => c.item.cid === last.cid);
//     if (at === -1) {
//         console.warn('bad children in goRight', node, last, children);
//         return null;
//     }
//     if (at < children.length - 1) {
//         let next = children[at + 1];
//         path = path.slice(0, -1).concat(next.item);
//         while (next.idx != null) {
//             const children = nodeChildren(store.map[next.idx].value);
//             if (!children.length) {
//                 console.warn(
//                     `no children in goRight`,
//                     store.map[next.idx].value,
//                 );
//                 return null;
//             }
//             next = children[0];
//             path.push(next.item);
//         }
//         return {
//             type: 'edit',
//             idx: next.item.idx,
//             path,
//             at: next.item.cid,
//         };
//     }
//     return goRight(store, last.idx, path.slice(0, -1));
// };

// export const nodeChildren = (
//     node: Store['map'][number]['value'],
// ): {
//     item: Path;
//     idx?: number;
// }[] => {
//     if (node.type === 'Apply') {
//         const children = [];
//         let idx = node.loc.idx;
//         let cid = 0;
//         children.push({ item: { cid: cid++, idx, punct: 0 } });
//         node.suffixes.forEach((suffix) => {
//             children.push({
//                 item: { cid: cid++, idx, punct: 0 },
//                 idx: suffix,
//             });
//         });
//         return children;
//     }
//     if (node.type === 'CallSuffix') {
//         const children = [];
//         let idx = node.loc.idx;
//         let cid = 0;
//         let punct = 0;
//         children.push({ item: { cid: cid++, idx: node.loc.idx, punct } });
//         punct += 1;
//         node.args.forEach((arg, i) => {
//             children.push({ item: { cid: cid++, idx, punct }, idx: arg });
//             if (i < node.args.length - 1) {
//                 punct += 2;
//             }
//         });
//         if (!node.args.length) {
//             children.push({ item: { cid: cid++, idx, punct } });
//         }
//         punct += 1;
//         children.push({ item: { cid: cid++, idx: node.loc.idx, punct } });
//         return children;
//     }
//     return [];
// };
