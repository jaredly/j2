import { File } from './base.parser';

interface IFace {
    comments: File['comments'];
}
export const fixComments = <T extends IFace>(ast: T): T => {
    const seen: { [off: number]: true } = {};
    ast.comments = ast.comments.filter((c) => {
        if (seen[c[0].start.offset]) {
            return false;
        }
        return (seen[c[0].start.offset] = true);
    });
    return ast;
};
