import {Loc, File, Toplevel, Expression, UnresolvedRef, DecoratedExpression, Decorator, DecoratorArg, Type, Sym, TLambda, TemplateString, Ref, Boolean, Number, Apply, TRef, TDecorated, TApply, TVars} from './typed-ast';

export type Visitor<Ctx> = {
    Loc?: (node: Loc, ctx: Ctx) => null | false | Loc | [Loc | null, Ctx]
    LocPost?: (node: Loc, ctx: Ctx) => null | Loc,
    File?: (node: File, ctx: Ctx) => null | false | File | [File | null, Ctx]
    FilePost?: (node: File, ctx: Ctx) => null | File,
    TemplateString?: (node: TemplateString, ctx: Ctx) => null | false | TemplateString | [TemplateString | null, Ctx]
    TemplateStringPost?: (node: TemplateString, ctx: Ctx) => null | TemplateString,
    Decorator?: (node: Decorator, ctx: Ctx) => null | false | Decorator | [Decorator | null, Ctx]
    DecoratorPost?: (node: Decorator, ctx: Ctx) => null | Decorator,
    DecoratorArg?: (node: DecoratorArg, ctx: Ctx) => null | false | DecoratorArg | [DecoratorArg | null, Ctx]
    DecoratorArgPost?: (node: DecoratorArg, ctx: Ctx) => null | DecoratorArg,
    UnresolvedRef?: (node: UnresolvedRef, ctx: Ctx) => null | false | UnresolvedRef | [UnresolvedRef | null, Ctx]
    UnresolvedRefPost?: (node: UnresolvedRef, ctx: Ctx) => null | UnresolvedRef,
    Ref?: (node: Ref, ctx: Ctx) => null | false | Ref | [Ref | null, Ctx]
    RefPost?: (node: Ref, ctx: Ctx) => null | Ref,
    Toplevel?: (node: Toplevel, ctx: Ctx) => null | false | Toplevel | [Toplevel | null, Ctx]
    ToplevelPost?: (node: Toplevel, ctx: Ctx) => null | Toplevel,
    Expression?: (node: Expression, ctx: Ctx) => null | false | Expression | [Expression | null, Ctx]
    ExpressionPost?: (node: Expression, ctx: Ctx) => null | Expression,
    DecoratedExpression?: (node: DecoratedExpression, ctx: Ctx) => null | false | DecoratedExpression | [DecoratedExpression | null, Ctx]
    DecoratedExpressionPost?: (node: DecoratedExpression, ctx: Ctx) => null | DecoratedExpression,
    Boolean?: (node: Boolean, ctx: Ctx) => null | false | Boolean | [Boolean | null, Ctx]
    BooleanPost?: (node: Boolean, ctx: Ctx) => null | Boolean,
    Number?: (node: Number, ctx: Ctx) => null | false | Number | [Number | null, Ctx]
    NumberPost?: (node: Number, ctx: Ctx) => null | Number,
    Apply?: (node: Apply, ctx: Ctx) => null | false | Apply | [Apply | null, Ctx]
    ApplyPost?: (node: Apply, ctx: Ctx) => null | Apply,
    Sym?: (node: Sym, ctx: Ctx) => null | false | Sym | [Sym | null, Ctx]
    SymPost?: (node: Sym, ctx: Ctx) => null | Sym,
    TRef?: (node: TRef, ctx: Ctx) => null | false | TRef | [TRef | null, Ctx]
    TRefPost?: (node: TRef, ctx: Ctx) => null | TRef,
    TDecorated?: (node: TDecorated, ctx: Ctx) => null | false | TDecorated | [TDecorated | null, Ctx]
    TDecoratedPost?: (node: TDecorated, ctx: Ctx) => null | TDecorated,
    TApply?: (node: TApply, ctx: Ctx) => null | false | TApply | [TApply | null, Ctx]
    TApplyPost?: (node: TApply, ctx: Ctx) => null | TApply,
    TVars?: (node: TVars, ctx: Ctx) => null | false | TVars | [TVars | null, Ctx]
    TVarsPost?: (node: TVars, ctx: Ctx) => null | TVars,
    TLambda?: (node: TLambda, ctx: Ctx) => null | false | TLambda | [TLambda | null, Ctx]
    TLambdaPost?: (node: TLambda, ctx: Ctx) => null | TLambda,
    Type?: (node: Type, ctx: Ctx) => null | false | Type | [Type | null, Ctx]
    TypePost?: (node: Type, ctx: Ctx) => null | Type
}
export const transformLoc = <Ctx>(node: Loc, visitor: Visitor<Ctx>, ctx: Ctx): Loc => {
        if (!node) {
            throw new Error('No Loc provided');
        }
        
        const transformed = visitor.Loc ? visitor.Loc(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        const updatedNode = node;
        
        node = updatedNode;
        if (visitor.LocPost) {
            const transformed = visitor.LocPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

// not a type Array

export const transformUnresolvedRef = <Ctx>(node: UnresolvedRef, visitor: Visitor<Ctx>, ctx: Ctx): UnresolvedRef => {
        if (!node) {
            throw new Error('No UnresolvedRef provided');
        }
        
        const transformed = visitor.UnresolvedRef ? visitor.UnresolvedRef(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        const updatedNode = node;
        
        node = updatedNode;
        if (visitor.UnresolvedRefPost) {
            const transformed = visitor.UnresolvedRefPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformSym = <Ctx>(node: Sym, visitor: Visitor<Ctx>, ctx: Ctx): Sym => {
        if (!node) {
            throw new Error('No Sym provided');
        }
        
        const transformed = visitor.Sym ? visitor.Sym(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        const updatedNode = node;
        
        node = updatedNode;
        if (visitor.SymPost) {
            const transformed = visitor.SymPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformTLambda = <Ctx>(node: TLambda, visitor: Visitor<Ctx>, ctx: Ctx): TLambda => {
        if (!node) {
            throw new Error('No TLambda provided');
        }
        
        const transformed = visitor.TLambda ? visitor.TLambda(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                let updatedNode$args = node.args;
                {
                    let changed2 = false;
                    const arr1 = node.args.map((updatedNode$args$item1) => {
                        
            let result = updatedNode$args$item1;
            {
                let changed3 = false;
                
                const result$typ = transformType(updatedNode$args$item1.typ, visitor, ctx);
                changed3 = changed3 || result$typ !== updatedNode$args$item1.typ;
                if (changed3) {
                    result =  {...result, typ: result$typ};
                    changed2 = true;
                }
            }
            
                        return result
                    })
                    if (changed2) {
                        updatedNode$args = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$result = transformType(node.result, visitor, ctx);
                changed1 = changed1 || updatedNode$result !== node.result;

                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, args: updatedNode$args, result: updatedNode$result, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.TLambdaPost) {
            const transformed = visitor.TLambdaPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformType = <Ctx>(node: Type, visitor: Visitor<Ctx>, ctx: Ctx): Type => {
        if (!node) {
            throw new Error('No Type provided');
        }
        
        const transformed = visitor.Type ? visitor.Type(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
        let updatedNode = node;
        switch (node.type) {
            case 'TRef': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'TDecorated': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                let updatedNode$0node$decorators = updatedNode$0specified.decorators;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.decorators.map((updatedNode$0node$decorators$item2) => {
                        
                const result = transformDecorator(updatedNode$0node$decorators$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$decorators$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$decorators = arr2;
                        changed2 = true;
                    }
                }
                

                
                const updatedNode$0node$inner = transformType(updatedNode$0specified.inner, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$inner !== updatedNode$0specified.inner;

                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, decorators: updatedNode$0node$decorators, inner: updatedNode$0node$inner, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'TApply': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$target = transformType(updatedNode$0specified.target, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$target !== updatedNode$0specified.target;

                
                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
                const result = transformType(updatedNode$0node$args$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$args$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                

                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, target: updatedNode$0node$target, args: updatedNode$0node$args, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'TVars': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
                const result = transformSym(updatedNode$0node$args$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$args$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                

                
                const updatedNode$0node$inner = transformType(updatedNode$0specified.inner, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$inner !== updatedNode$0specified.inner;

                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, args: updatedNode$0node$args, inner: updatedNode$0node$inner, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            default: {
                        // let changed1 = false;
                        
                const updatedNode$0node = transformTLambda(node, visitor, ctx);
                changed0 = changed0 || updatedNode$0node !== node;
                        updatedNode = updatedNode$0node;
                    }
        }
        
        node = updatedNode;
        if (visitor.TypePost) {
            const transformed = visitor.TypePost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformDecoratorArg = <Ctx>(node: DecoratorArg, visitor: Visitor<Ctx>, ctx: Ctx): DecoratorArg => {
        if (!node) {
            throw new Error('No DecoratorArg provided');
        }
        
        const transformed = visitor.DecoratorArg ? visitor.DecoratorArg(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
        let updatedNode = node;
        switch (node.type) {
            case 'Expr': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$expr = transformExpression(updatedNode$0specified.expr, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$expr !== updatedNode$0specified.expr;

                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, expr: updatedNode$0node$expr, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'Type': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$typ = transformType(updatedNode$0specified.typ, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$typ !== updatedNode$0specified.typ;

                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, typ: updatedNode$0node$typ, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }
        }
        
        node = updatedNode;
        if (visitor.DecoratorArgPost) {
            const transformed = visitor.DecoratorArgPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformDecorator = <Ctx>(node: Decorator, visitor: Visitor<Ctx>, ctx: Ctx): Decorator => {
        if (!node) {
            throw new Error('No Decorator provided');
        }
        
        const transformed = visitor.Decorator ? visitor.Decorator(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
            let updatedNode$id = node.id;
            {
                let changed2 = false;
                
                const updatedNode$id$loc = transformLoc(node.id.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$id$loc !== node.id.loc;
                if (changed2) {
                    updatedNode$id =  {...updatedNode$id, loc: updatedNode$id$loc};
                    changed1 = true;
                }
            }
            

                
                let updatedNode$args = node.args;
                {
                    let changed2 = false;
                    const arr1 = node.args.map((updatedNode$args$item1) => {
                        
            let result = updatedNode$args$item1;
            {
                let changed3 = false;
                
                const result$arg = transformDecoratorArg(updatedNode$args$item1.arg, visitor, ctx);
                changed3 = changed3 || result$arg !== updatedNode$args$item1.arg;

                
                const result$loc = transformLoc(updatedNode$args$item1.loc, visitor, ctx);
                changed3 = changed3 || result$loc !== updatedNode$args$item1.loc;
                if (changed3) {
                    result =  {...result, arg: result$arg, loc: result$loc};
                    changed2 = true;
                }
            }
            
                        return result
                    })
                    if (changed2) {
                        updatedNode$args = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, id: updatedNode$id, args: updatedNode$args, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.DecoratorPost) {
            const transformed = visitor.DecoratorPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformDecoratedExpression = <Ctx>(node: DecoratedExpression, visitor: Visitor<Ctx>, ctx: Ctx): DecoratedExpression => {
        if (!node) {
            throw new Error('No DecoratedExpression provided');
        }
        
        const transformed = visitor.DecoratedExpression ? visitor.DecoratedExpression(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                let updatedNode$decorators = node.decorators;
                {
                    let changed2 = false;
                    const arr1 = node.decorators.map((updatedNode$decorators$item1) => {
                        
                const result = transformDecorator(updatedNode$decorators$item1, visitor, ctx);
                changed2 = changed2 || result !== updatedNode$decorators$item1;
                        return result
                    })
                    if (changed2) {
                        updatedNode$decorators = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
                changed1 = changed1 || updatedNode$expr !== node.expr;

                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, decorators: updatedNode$decorators, expr: updatedNode$expr, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.DecoratedExpressionPost) {
            const transformed = visitor.DecoratedExpressionPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformExpression = <Ctx>(node: Expression, visitor: Visitor<Ctx>, ctx: Ctx): Expression => {
        if (!node) {
            throw new Error('No Expression provided');
        }
        
        const transformed = visitor.Expression ? visitor.Expression(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
        let updatedNode = node;
        switch (node.type) {
            case 'Apply': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$target = transformExpression(updatedNode$0specified.target, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$target !== updatedNode$0specified.target;

                
                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
                const result = transformExpression(updatedNode$0node$args$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$args$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                

                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, target: updatedNode$0node$target, args: updatedNode$0node$args, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'Number': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'Boolean': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'TemplateString': break;

            case 'Ref': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$loc = transformLoc(updatedNode$0specified.loc, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$loc !== updatedNode$0specified.loc;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, loc: updatedNode$0node$loc};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            default: {
                        // let changed1 = false;
                        
                const updatedNode$0node = transformDecoratedExpression(node, visitor, ctx);
                changed0 = changed0 || updatedNode$0node !== node;
                        updatedNode = updatedNode$0node;
                    }
        }
        
        node = updatedNode;
        if (visitor.ExpressionPost) {
            const transformed = visitor.ExpressionPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformToplevel = <Ctx>(node: Toplevel, visitor: Visitor<Ctx>, ctx: Ctx): Toplevel => {
        if (!node) {
            throw new Error('No Toplevel provided');
        }
        
        const transformed = visitor.Toplevel ? visitor.Toplevel(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                const updatedNode$expr = transformExpression(node.expr, visitor, ctx);
                changed1 = changed1 || updatedNode$expr !== node.expr;

                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, expr: updatedNode$expr, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.ToplevelPost) {
            const transformed = visitor.ToplevelPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformFile = <Ctx>(node: File, visitor: Visitor<Ctx>, ctx: Ctx): File => {
        if (!node) {
            throw new Error('No File provided');
        }
        
        const transformed = visitor.File ? visitor.File(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                let updatedNode$toplevels = node.toplevels;
                {
                    let changed2 = false;
                    const arr1 = node.toplevels.map((updatedNode$toplevels$item1) => {
                        
                const result = transformToplevel(updatedNode$toplevels$item1, visitor, ctx);
                changed2 = changed2 || result !== updatedNode$toplevels$item1;
                        return result
                    })
                    if (changed2) {
                        updatedNode$toplevels = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, toplevels: updatedNode$toplevels, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.FilePost) {
            const transformed = visitor.FilePost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformTemplateString = <Ctx>(node: TemplateString, visitor: Visitor<Ctx>, ctx: Ctx): TemplateString => {
        if (!node) {
            throw new Error('No TemplateString provided');
        }
        
        const transformed = visitor.TemplateString ? visitor.TemplateString(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        const updatedNode = node;
        
        node = updatedNode;
        if (visitor.TemplateStringPost) {
            const transformed = visitor.TemplateStringPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformRef = <Ctx>(node: Ref, visitor: Visitor<Ctx>, ctx: Ctx): Ref => {
        if (!node) {
            throw new Error('No Ref provided');
        }
        
        const transformed = visitor.Ref ? visitor.Ref(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.RefPost) {
            const transformed = visitor.RefPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformBoolean = <Ctx>(node: Boolean, visitor: Visitor<Ctx>, ctx: Ctx): Boolean => {
        if (!node) {
            throw new Error('No Boolean provided');
        }
        
        const transformed = visitor.Boolean ? visitor.Boolean(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.BooleanPost) {
            const transformed = visitor.BooleanPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformNumber = <Ctx>(node: Number, visitor: Visitor<Ctx>, ctx: Ctx): Number => {
        if (!node) {
            throw new Error('No Number provided');
        }
        
        const transformed = visitor.Number ? visitor.Number(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.NumberPost) {
            const transformed = visitor.NumberPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformApply = <Ctx>(node: Apply, visitor: Visitor<Ctx>, ctx: Ctx): Apply => {
        if (!node) {
            throw new Error('No Apply provided');
        }
        
        const transformed = visitor.Apply ? visitor.Apply(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                const updatedNode$target = transformExpression(node.target, visitor, ctx);
                changed1 = changed1 || updatedNode$target !== node.target;

                
                let updatedNode$args = node.args;
                {
                    let changed2 = false;
                    const arr1 = node.args.map((updatedNode$args$item1) => {
                        
                const result = transformExpression(updatedNode$args$item1, visitor, ctx);
                changed2 = changed2 || result !== updatedNode$args$item1;
                        return result
                    })
                    if (changed2) {
                        updatedNode$args = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, target: updatedNode$target, args: updatedNode$args, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.ApplyPost) {
            const transformed = visitor.ApplyPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformTRef = <Ctx>(node: TRef, visitor: Visitor<Ctx>, ctx: Ctx): TRef => {
        if (!node) {
            throw new Error('No TRef provided');
        }
        
        const transformed = visitor.TRef ? visitor.TRef(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.TRefPost) {
            const transformed = visitor.TRefPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformTDecorated = <Ctx>(node: TDecorated, visitor: Visitor<Ctx>, ctx: Ctx): TDecorated => {
        if (!node) {
            throw new Error('No TDecorated provided');
        }
        
        const transformed = visitor.TDecorated ? visitor.TDecorated(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                let updatedNode$decorators = node.decorators;
                {
                    let changed2 = false;
                    const arr1 = node.decorators.map((updatedNode$decorators$item1) => {
                        
                const result = transformDecorator(updatedNode$decorators$item1, visitor, ctx);
                changed2 = changed2 || result !== updatedNode$decorators$item1;
                        return result
                    })
                    if (changed2) {
                        updatedNode$decorators = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$inner = transformType(node.inner, visitor, ctx);
                changed1 = changed1 || updatedNode$inner !== node.inner;

                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, decorators: updatedNode$decorators, inner: updatedNode$inner, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.TDecoratedPost) {
            const transformed = visitor.TDecoratedPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformTApply = <Ctx>(node: TApply, visitor: Visitor<Ctx>, ctx: Ctx): TApply => {
        if (!node) {
            throw new Error('No TApply provided');
        }
        
        const transformed = visitor.TApply ? visitor.TApply(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                const updatedNode$target = transformType(node.target, visitor, ctx);
                changed1 = changed1 || updatedNode$target !== node.target;

                
                let updatedNode$args = node.args;
                {
                    let changed2 = false;
                    const arr1 = node.args.map((updatedNode$args$item1) => {
                        
                const result = transformType(updatedNode$args$item1, visitor, ctx);
                changed2 = changed2 || result !== updatedNode$args$item1;
                        return result
                    })
                    if (changed2) {
                        updatedNode$args = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, target: updatedNode$target, args: updatedNode$args, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.TApplyPost) {
            const transformed = visitor.TApplyPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformTVars = <Ctx>(node: TVars, visitor: Visitor<Ctx>, ctx: Ctx): TVars => {
        if (!node) {
            throw new Error('No TVars provided');
        }
        
        const transformed = visitor.TVars ? visitor.TVars(node, ctx) : null;
        if (transformed === false) {
            return node;
        }
        if (transformed != null) {
            if (Array.isArray(transformed)) {
                ctx = transformed[1];
                if (transformed[0] != null) {
                    node = transformed[0];
                }
            } else {
                node = transformed;
            }
        }
        
        let changed0 = false;
        
            let updatedNode = node;
            {
                let changed1 = false;
                
                let updatedNode$args = node.args;
                {
                    let changed2 = false;
                    const arr1 = node.args.map((updatedNode$args$item1) => {
                        
                const result = transformSym(updatedNode$args$item1, visitor, ctx);
                changed2 = changed2 || result !== updatedNode$args$item1;
                        return result
                    })
                    if (changed2) {
                        updatedNode$args = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$inner = transformType(node.inner, visitor, ctx);
                changed1 = changed1 || updatedNode$inner !== node.inner;

                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, args: updatedNode$args, inner: updatedNode$inner, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.TVarsPost) {
            const transformed = visitor.TVarsPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }
