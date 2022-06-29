import { File } from './base.parser';

export const fixComments = (ast: File) => {
    const seen: { [off: number]: true } = {};
    ast.comments = ast.comments.filter((c) => {
        if (seen[c[0].start.offset]) {
            return false;
        }
        return (seen[c[0].start.offset] = true);
    });
    return ast;
};
