// Let's do ourselves a hindley milner
// I'm converting https://github.com/jfecher/algorithm-j/blob/master/j.ml
// as a starting point.
import equal from 'fast-deep-equal';

/*
 *  This implementation follows the type inference rules given at
 *  https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system#Algorithm_J
 *
 *  The algorithm itself uses most of the names from the above link, with
 *  a few changed for ease of typing:
 *       Γ (gamma) => env
 *       ⊢ⱼ (perpendicular symbol with j subscript, a.k.a. algorithm J) => infer
 *       Γ¯ (gamma bar) => generalize
 *
 *  And some expr constructors changed to match their more colloquial names
 *  to hopefully make this somewhat more approachable:
 *       Var => Identifier
 *       App => FnCall
 *       Abs => Lambda
 *
 *  Note that a let-binding (or Declaration here) can be of either
 *  a variable or a function
 *
 *  Additionally, implementation of "levels" for efficient generalization is
 *  taken from http://okmij.org/ftp/ML/generalization.html
 */

type typevar_id = number;
type level = number;

type typ =
    | { type: 'TUnit' }

    /* 'a, 'b, etc. */
    /* A reference to a bound or unbound typevar, set during unification.
     * This is unique to algorithm J where mutation is needed to remember
     * some substitutions.
     * The level of this typevar identifies how many let-bindings deep it was
     * declared in. This is used to prevent generalization of typevars that
     * escape outside the current let-binding scope. */
    | { type: 'TVar'; contents: { current: typevar } } // of typevar ref

    /* 'a -> 'b, all functions are single-argument only */
    /* e.g. \a b c.c  is automatically translated to \a.\b.\c.c  */
    /* Currying is also automatic */
    | { type: 'Fn'; arg: typ; ret: typ }; // of typ * typ

type typevar =
    | { type: 'Bound'; contents: typ }
    | { type: 'Unbound'; level: level; id: typevar_id }; //  of typevar_id * level

/* Polytypes in the form  forall 'a 'b ... 'y . 'z  */
/* The typevar list will be a list of all monomorphic typevars in 'z */
/* Used only in let-bindings to make the declaration polymorphic */
type polytype = { type: 'PolyType'; typevars: Array<typevar_id>; typ: typ }; // list * typ

type ref<T> = { current: T };

let current_level = { current: 1 };
let current_typevar = { current: 0 };

let enter_level = () => current_level.current++;
let exit_level = () => current_level.current--;

let newvar = () => {
    current_typevar.current++;
    return current_typevar.current;
};

let newvar_t = (): typ => ({
    type: 'TVar',
    contents: {
        current: {
            type: 'Unbound',
            id: newvar(),
            level: current_level.current,
        },
    },
});

/*
 * Working with a simple language with unit, variables,
 * type annotations, lambdas, and function application
 */
// open Expr
/* in expr.mli:
 */
type expr =
    | { type: 'Unit' }
    | { type: 'Identifier'; text: string } // of string
    | { type: 'Lambda'; arg: string; body: expr } // of string * expr
    | { type: 'FnCall'; target: expr; arg: expr } // of expr * expr
    | { type: 'Let'; name: string; value: expr; body: expr }; // of string * expr * expr

// exception TypeError

/*
 * The type environment contains our current assumptions
 * of variable types
 */
// module SMap = Map.Make(String)

/* Setup for our Hashtbl of int -> 't */
// module HashableInt = struct
//     include Int
//     let hash = Hashtbl.hash
// end

/* Provides 'a Itbl.t and member functions */
// module ITbl = Hashtbl.Make(HashableInt)

let inst = ({ typevars, typ }: polytype) => {
    let replace_tvs = (tbl: Map<number, typ>, t: typ): typ => {
        switch (t.type) {
            case 'TUnit':
                return t;
            case 'TVar':
                if (t.contents.current.type === 'Bound') {
                    return replace_tvs(tbl, t.contents.current.contents);
                } else {
                    return tbl.get(t.contents.current.id) ?? t;
                }
            case 'Fn':
                return {
                    type: 'Fn',
                    arg: replace_tvs(tbl, t.arg),
                    ret: replace_tvs(tbl, t.ret),
                };
        }
    };
    const toReplace = new Map();
    typevars.forEach((id) => toReplace.set(id, newvar_t()));
    return replace_tvs(toReplace, typ);
};

/* specializes the polytype s by copying the term and replacing the
 * bound type variables consistently by new monotype variables
 * E.g.   inst (forall a b. a -> b -> a) = c -> d -> c     */
// let inst_ (PolyType(typevars, typ)) : typ =
//     /* Replace any typevars found in the Hashtbl with the
//      * associated value in the same table, leave them otherwise */
//     let rec replace_tvs tbl = function
//         | TUnit -> TUnit
//         | TVar({ contents = Bound t }) -> replace_tvs tbl t
//         | TVar({ contents = Unbound (n, level)}) as t ->
//             begin match ITbl.find_opt tbl n with
//             | Some t' -> t'
//             | None -> t
//             end
//         | Fn(a, b) -> Fn(replace_tvs tbl a, replace_tvs tbl b)
//     in
//     /* Note that the returned type is no longer a PolyType,
//      * this means it is now monomorphic, the 'forall' is gone. */
//     let tvs_to_replace = ITbl.create 1 in
//     List.iter (fun tv -> ITbl.add tvs_to_replace tv (newvar_t ())) typevars;
//     replace_tvs tvs_to_replace typ

/* Can a monomorphic TVar(a) be found inside this type? */
let occurs = (a_id: typevar_id, a_level: level, typ: typ): boolean => {
    switch (typ.type) {
        case 'TUnit':
            return false;
        case 'TVar':
            if (typ.contents.current.type === 'Bound') {
                return occurs(a_id, a_level, typ.contents.current.contents);
            } else {
                let { id: b_id, level: b_level } = typ.contents.current;
                let min_level = Math.min(a_level, b_level);
                typ.contents.current = {
                    type: 'Unbound',
                    id: b_id,
                    level: min_level,
                };
                return a_id === b_id;
            }
        case 'Fn':
            return (
                occurs(a_id, a_level, typ.arg) || occurs(a_id, a_level, typ.ret)
            );
    }
};

let unify = (t1: typ, t2: typ): void => {
    if (t1.type === 'TUnit' && t2.type === 'TUnit') {
        return;
    }
    if (t1.type === 'TVar' && t1.contents.current.type === 'Bound') {
        unify(t1.contents.current.contents, t2);
        return;
    }
    if (t2.type === 'TVar' && t2.contents.current.type === 'Bound') {
        unify(t1, t2.contents.current.contents);
        return;
    }
    if (t1.type === 'TVar' && t1.contents.current.type === 'Unbound') {
        let { id: a_id, level: a_level } = t1.contents.current;
        if (equal(t1, t2)) {
            return;
        }
        if (occurs(a_id, a_level, t2)) {
            throw new Error('Occurs check failed');
        }
        t1.contents.current = { type: 'Bound', contents: t2 };
        return;
    }
    if (t2.type === 'TVar' && t2.contents.current.type === 'Unbound') {
        let { id: b_id, level: b_level } = t2.contents.current;
        if (equal(t1, t2)) {
            return;
        }
        if (occurs(b_id, b_level, t1)) {
            throw new Error('Occurs check failed');
        }
        t2.contents.current = { type: 'Bound', contents: t1 };
        return;
    }
    if (t1.type === 'Fn' && t2.type === 'Fn') {
        unify(t1.arg, t2.arg);
        unify(t1.ret, t2.ret);
        return;
    }
    throw new Error('Unification failed');
};

// let rec unify_ (t1: typ) (t2: typ) : unit =
//     match (t1, t2) with
//     | (TUnit, TUnit) -> ()

//     /* These two recursive calls to the bound typevar replace
//      * the 'find' in the union-find algorithm */
//     | (TVar({ contents = Bound a' }), b) -> unify a' b
//     | (a, TVar({ contents = Bound b' })) -> unify a b'

// | (TVar({ contents = Unbound(a_id, a_level) } as a), b) ->
//     /* create binding for boundTy that is currently empty */
//     if t1 = t2 then () else /* a = a, but dont create a recursive binding to itself */
//     if occurs a_id a_level b then raise TypeError else
//     a := Bound b

// | (a, TVar({ contents = Unbound(b_id, b_level)} as b)) ->
//     /* create binding for boundTy that is currently empty */
//     if t1 = t2 then () else
//     if occurs b_id b_level a then raise TypeError else
//     b := Bound a

// | (Fn(a, b), Fn(c, d)) ->
//     unify a c;
//     unify b d

// | (a, b) -> raise TypeError

let generalize = (t: typ): polytype => {
    let find_all_tvs = (t: typ): Array<typevar_id> => {
        switch (t.type) {
            case 'TUnit':
                return [];
            case 'TVar':
                if (t.contents.current.type === 'Bound') {
                    return find_all_tvs(t.contents.current.contents);
                }
                let { id: t_id, level: t_level } = t.contents.current;
                if (t_level > current_level.current) {
                    return [t_id];
                } else {
                    return [];
                }
            case 'Fn':
                return find_all_tvs(t.arg).concat(find_all_tvs(t.ret));
        }
    };
    const unique: { [key: number]: true } = {};
    find_all_tvs(t).forEach((id) => (unique[id] = true));
    return {
        type: 'PolyType',
        typevars: Object.keys(unique).map((id) => +id),
        typ: t,
    };
};

// /* Find all typevars and wrap the type in a PolyType */
// /* e.g.  generalize (a -> b -> b) = forall a b. a -> b -> b  */
// let generalize_ (t: typ) : polytype =
//     /* collect all the monomorphic typevars */
//     let rec find_all_tvs = function
//         | TUnit -> []
//         | TVar({ contents = Bound t }) -> find_all_tvs t
//         | TVar({ contents = Unbound (n, level)}) ->
//             if level > !current_level then [n]
//             else []
//         | Fn(a, b) -> find_all_tvs a @ find_all_tvs b

//     in find_all_tvs t
//     |> List.sort_uniq compare
//     |> fun typevars -> PolyType(typevars, t)

/* For the Abs/Lambda rule, parameter types need to be stored in */
/* our polytype map, though parameters shouldn't be generalized  */
/* since their types shouldn't change (be instantiated) within the function. */
/* This helper function performs the conversion while making that explicit. */
let dont_generalize = (t: typ): polytype => {
    return { type: 'PolyType', typevars: [], typ: t };
};

let infer = (env: Map<string, polytype>, expr: expr): typ => {
    switch (expr.type) {
        case 'Unit':
            return { type: 'TUnit' };
        case 'Identifier':
            let s = env.get(expr.text)!;
            return inst(s);
        case 'FnCall':
            let t0 = infer(env, expr.arg);
            let t1 = infer(env, expr.target);
            let tp = newvar_t();
            unify(t1, { type: 'Fn', ret: tp, arg: t0 });
            return tp;
        case 'Lambda': {
            let t = newvar_t();
            let envp = new Map(env.entries());
            envp.set(expr.arg, dont_generalize(t));
            return { type: 'Fn', arg: t, ret: infer(envp, expr.body) };
        }
        case 'Let': {
            enter_level();
            let t = infer(env, expr.value);
            exit_level();
            let envp = new Map(env.entries());
            envp.set(expr.name, generalize(t));
            return infer(envp, expr.body);
        }
    }
};

/* The main entry point to type inference */
/* All branches (except for the trivial Unit) of the first match in this function
   are translated directly from the rules for algorithm J, given in comments */
/* infer : polytype SMap.t -> Expr -> Type */
// let rec infer_ env_ : expr -> typ = function
//     | Unit -> TUnit

//     /* Var
//      *   x : s ∊ env
//      *   t = inst s
//      *   -----------
//      *   infer env x = t
//      */
//     | Identifier x ->
//         let s = SMap.find x env in
//         let t = inst s in
//         t

/* App
 *   infer env f = t0
 *   infer env x = t1
 *   t' = newvar ()
 *   unify t0 (t1 -> t')
 *   ---------------
 *   infer env (f x) = t'
 */
// | FnCall(f, x) ->
//     let t0 = infer env f in
//     let t1 = infer env x in
//     let t' = newvar_t () in
//     unify t0 (Fn(t1, t'));
//     t'

/* Abs
 *   t = newvar ()
 *   infer (SMap.add x t env) e = t'
 *   -------------
 *   infer env (fun x -> e) = t -> t'
 */
// | Lambda(x, e) ->
//     let t = newvar_t () in
//     /* t must be a polytype to go in our map, so make an empty forall */
//     let env' = SMap.add x (dont_generalize t) env in
//     let t' = infer env' e in
//     Fn(t, t')

/* Let
 *   infer env e0 = t
 *   infer (SMap.add x (generalize t) env) e1 = t'
 *   -----------------
 *   infer env (let x = e0 in e1) = t'
 *
 * enter/exit_level optimizations are from
 * http://okmij.org/ftp/ML/generalization.html
 * In this implementation, they're required so we
 * don't generalize types that escape into the environment.
 */
// | Let(x, e0, e1) ->
//     enter_level ();
//     let t = infer env e0 in
//     exit_level ();
//     let t' = infer (SMap.add x (generalize t) env) e1 in
//     t'

/******************************************************************************
                       front-end for parsing exprs on
                        the command line and showing
                             their computed types
******************************************************************************/

/* Return the next unique lowercase-letter string after the given one, e.g: */
/*   next_letter "'a" = "'b"
 *   next_letter "'b" = "'c"
 *   next_letter "'z" = "'{"   This can be fixed but most examples shouldn't have > 26 typevars anyway
 *
 */
// let next_letter (s: bytes) =
//     let c = Bytes.get s 1 in
//     Bytes.set s 1 (Char.chr (Char.code c + 1))

// /* If this type is the a in a -> b, should it be parenthesized? */
// /* Note this is recursive in case bound typevars are used */
// let rec should_parenthesize = function
//     | TVar({ contents = Bound t' }) -> should_parenthesize t'
//     | Fn(_, _) -> true
//     | _ -> false

// /* pretty printing types */
// let string_of_type (t : typ) : string =
//     /* Keep track of number to character bindings for typevars
//      * e.g. '2 => 'a, '5 => 'b, etc.
//      * Letters are assigned to typevars by the order in which the typevars
//      * appear in the type, left to right */
//     let rec string_of_type' cur_typevar_name typevar_name_tbl = function
//     | TUnit -> "unit"
//     | TVar({ contents = Bound t' }) -> string_of_type' cur_typevar_name typevar_name_tbl t'
//     | TVar({ contents = Unbound(n, _) }) ->
//         begin match ITbl.find_opt typevar_name_tbl n with
//         | Some s -> s
//         | None ->
//             let s = Bytes.to_string cur_typevar_name in
//             ITbl.add typevar_name_tbl n s;
//             next_letter cur_typevar_name;
//             s
//         end
//     | Fn(a, b) ->
//         let a_str = string_of_type' cur_typevar_name typevar_name_tbl a in
//         let b_str = string_of_type' cur_typevar_name typevar_name_tbl b in
//         if should_parenthesize a then "(" ^ a_str ^ ") -> " ^ b_str
//         else a_str ^ " -> " ^ b_str

//     in string_of_type' (Bytes.of_string "'a") (ITbl.create 1) t

// let print_type (t: typ) : unit =
//     print_string (string_of_type t)

// /* The classic read-eval-printline-loop */
// let rec main () =
//     (try
//         print_string "> ";
//         read_line ()
//         |> Lexer.parse
//         |> infer SMap.empty
//         |> print_type;
//         print_string "\n"
//     with
//        | TypeError -> print_endline "type error"
//        | Not_found -> print_endline "variable not found"
//        | Failure(s) -> print_endline "lexing failure, invalid symbol");
//     current_typevar := 0;
//     main ()

// let () = main ()
