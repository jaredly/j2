
ok so I'm doing some path stuff ...

I kindof think

Ok, so let's just say: for each node, here are the possible paths

Node Path

{
	type: 'Number',
	idx: number,
	path: null | {type: 'before' | 'after'}
}

{
	type: 'Boolean',
	idx: number,
	path: null | {type: 'before' | 'after'}
}

{
	type: 'Identifier',
	idx: number,
	path: null | {type: 'before' | 'after'}
}

{
	type: 'UInt',
	idx: number,
	path: null | {type: 'before' | 'after'}
}

{
	type: 'Apply',
	idx: number,
	path: null | {type: 'target'} | {type: 'suffix', suffix: i} | {type: 'before' | 'after'}
}

{
	type: 'CallSuffix',
	idx: number,
	path: null | {type: 'args', arg: i} | {type: 'args_empty'} | {type: 'before' | 'after'}
}

{
	type: 'Lambda',
	idx: number,
	path: null | {type: 'args', arg: i} | {type: 'args_empty'} | {type: 'res'} | {type: 'body'} | {type: 'before' | 'after'}
}

{
	type: 'Larg',
	idx: number,
	path: null | {type: 'path'} | {type: 'typ'} | {type: 'before' | 'after'}
}