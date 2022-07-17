import fs from 'fs';
import { execSync } from 'child_process';

const files = execSync(`grep -F '/*:macro' -r core -l`)
    .toString()
    .split('\n')
    .filter(Boolean);

const evaluate = (code: string) => {
    const f = new Function(code);
    return f();
};

console.log('ok', files);
files.forEach((file) => {
    let lines = fs.readFileSync(file, 'utf8').split('\n');
    let res: string[] = [];
    let block: null | string[] = null;
    lines.forEach((line) => {
        if (line.trim() === '/*:macro') {
            block = [];
        } else if (block != null) {
            if (line.trim() === '/*:endmacro*/') {
                const end = block.findIndex((x) => x.trim() === '*/');
                const code = block.slice(0, end).join('\n');
                const macrod = evaluate(code);
                res.push('/*:macro\n' + code + '\n*/');
                res.push(macrod);
                res.push('/*:endmacro*/');
                console.log(macrod);
                block = null;
            } else {
                block.push(line);
            }
        } else {
            res.push(line);
        }
    });

    const contents = res.join('\n');
    fs.writeFileSync(file, contents, 'utf8');
});
