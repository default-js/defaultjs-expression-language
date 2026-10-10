import ResolverContextHandle from "./ResolverContextHandle.js";
import Executer from "./Executer.js";
/**
 * Resolves `${...}` expressions against a context. A resolver may have a parent, and the resolvers
 * from it up to the root form a chain: a name is looked up from this resolver towards the root, and
 * a scope prefix `${name::statement}` addresses one resolver of the chain.
 *
 * Used statically with an ad-hoc context (`resolve`, `resolveText`), or as an instance within a
 * chain.
 *
 * @export
 * @class ExpressionResolver
 */
export default class ExpressionResolver {
    #private;
    /**
     * Sets the executer a resolver without a parent takes where the `executer` option is left out,
     * and so the executer of the static entry points.
     *
     * @param {string|Executer} anExecuter a registered name or an `Executer` instance
     * @throws {TypeError} where the value is neither a string nor an `Executer` instance
     * @throws {Error} where a name is not registered
     */
    static set defaultExecuter(anExecuter: string | Executer);
    /**
     * The executer a resolver without a parent takes where the `executer` option is left out;
     * `context-deconstruction-executer` until it is set.
     *
     * @type {Executer}
     */
    static get defaultExecuter(): Executer;
    /**
     * @constructor
     * @param {object} [options]
     * @param {?object} [options.context] any object; where none is passed - left out, null or
     * undefined - the resolver has no context of its own
     * @param {?ExpressionResolver} [options.parent=null]
     * @param {?string} [options.name=null] kept trimmed; where none is passed, one is generated
     * @param {?(string|Executer)} [options.executer] the registered name of an executer, or an
     * `Executer` instance. A name that is not registered throws; an instance needs no registration,
     * because it addresses the executer directly. Null and undefined count as left out. Without the
     * option the resolver takes the executer of its parent, and one without a parent
     * `ExpressionResolver.defaultExecuter`.
     * @throws {TypeError} where the parent is no resolver, the context a primitive, the name no
     * string, empty, or carrying a character a scope name cannot carry, or the executer neither a
     * string nor an `Executer` instance
     * @throws {Error} where the executer is named and the name is not registered
     */
    constructor({ context, parent, name, executer }?: {
        context?: object | null;
        parent?: ExpressionResolver | null;
        name?: string | null;
        executer?: (string | Executer) | null;
    });
    /**
     * The name this resolver is addressed by in a scope prefix and a filter.
     *
     * @type {string}
     */
    get name(): string;
    /**
     * @type {ExpressionResolver|null}
     */
    get parent(): ExpressionResolver | null;
    /**
     * The context of this resolver as an expression sees it. It is not the object passed to the
     * constructor and it answers for the whole chain. Over the global object it is the global
     * object itself.
     *
     * @type {Record<string|symbol, *>}
     */
    get context(): Record<string | symbol, any>;
    /**
     * The executer in use, chosen once in the constructor.
     *
     * @type {Executer}
     */
    get executer(): Executer;
    /**
     * The internal handle behind the context, public for `resetCache`.
     *
     * @type {ResolverContextHandle}
     */
    get contextHandle(): ResolverContextHandle;
    /**
     * The names of every resolver from the root down to this one, as a path - `/root/…/this`. It
     * describes the structure and does not change.
     *
     * @type {string}
     */
    get chain(): string;
    /**
     * The names of the resolvers from the root down to this one that provide a context, as a path
     * like `chain`. A resolver built without a context joins it the moment a value is set on it, so
     * this describes a state and not the structure. Where none provides one,
     * the answer is the empty string.
     *
     * @type {string}
     */
    get effectiveChain(): string;
    /**
     * The contexts of exactly the resolvers `effectiveChain` names, as an array, this resolver's
     * first and the root's last. A state like `effectiveChain`.
     *
     * @type {Array<Record<string|symbol, *>>}
     */
    get contextChain(): Array<Record<string | symbol, any>>;
    /**
     * Reads a value along the chain, from the addressed resolver towards the root. Without a key -
     * null or undefined - it answers the whole context of that resolver, which still sees the chain on
     * every access.
     *
     * @param {?(string|number|symbol)} [key] a property key; a number is looked up as its string
     * @param {?string} [filter] the scope name of the resolver the call addresses; without one, this
     * resolver
     * @returns {*} the value, or the whole context without a key
     * @throws {TypeError} where the key is of a type no property key has, or the filter no string
     * @throws {Error} where the filter matches no resolver of the chain
     */
    getData(key?: (string | number | symbol) | null, filter?: string | null): any;
    /**
     * Sets a value, in the object the caller handed over. Without a filter the value is changed where
     * the key lives, counting from here towards the root, and created here where no resolver carries
     * it. With a filter the addressed resolver is the target outright.
     *
     * @param {string|number|symbol} key a property key; a number is looked up as its string
     * @param {*} value
     * @param {?string} [filter] the scope name of the resolver the call addresses
     * @throws {TypeError} where the key is missing or of a type no property key has, the filter no
     * string, or the object refuses the write
     * @throws {Error} where the filter matches no resolver of the chain
     */
    updateData(key: string | number | symbol, value: any, filter?: string | null): void;
    /**
     * Removes the key from one resolver - the addressed one with a filter, and without one the first
     * resolver carrying it, counting from here towards the root. Removing it uncovers the value of
     * the next resolver that carries the same key.
     *
     * @param {string|number|symbol} key a property key; a number is looked up as its string
     * @param {?string} [filter] the scope name of the resolver the call addresses
     * @throws {TypeError} where the key is missing or of a type no property key has, the filter no
     * string, or the object refuses the deletion
     * @throws {Error} where the filter matches no resolver of the chain
     */
    deleteData(key: string | number | symbol, filter?: string | null): void;
    /**
     * A shallow assignment, key by key, into the context of the addressed resolver, replacing what is
     * there and adding what is not. No search along the chain: a merged key shadows the resolvers
     * above from here on.
     *
     * @param {?object} context the keys to assign; null or undefined changes nothing
     * @param {?string} [filter] the scope name of the resolver the call addresses
     * @throws {TypeError} where the context is a primitive, the filter no string, or the object
     * refuses a key - the keys before it are written by then
     * @throws {Error} where the filter matches no resolver of the chain
     */
    mergeContext(context: object | null, filter?: string | null): void;
    /**
     * Resolves one expression to its value, of whatever type the statement answers. Takes the
     * delimited form `${...}`, a scope prefix included, or a bare statement; an input that does not
     * both open with `${` and end with `}` is a bare statement. An error of the statement is logged
     * and handed on, and the default never covers it.
     *
     * @async
     * @param {string} aExpression
     * @param {*} [aDefault] replaces a result of null or undefined where it is passed, undefined
     * included
     * @returns {Promise<*>}
     * @throws {TypeError} where the expression is no string
     */
    resolve(aExpression: string, aDefault?: any): Promise<any>;
    /**
     * Replaces every expression of a text by its value and answers the text. An expression whose
     * statement fails stands as written, a warning names it, and the rest of the text keeps rendering.
     *
     * @async
     * @param {string} aText
     * @param {*} [aDefault] replaces a result of null or undefined, per expression, where it is
     * passed
     * @returns {Promise<string>}
     * @throws {TypeError} where the text is no string
     */
    resolveText(aText: string, aDefault?: any): Promise<string>;
    static resolve(aExpression: string, aContext?: object | null, aDefault?: any, aTimeout?: number | null): Promise<any>;
    static resolve(aConfiguration: {
        expression: string;
        context?: object | null;
        defaultValue?: any;
        timeout?: number | null;
    }): Promise<any>;
    static resolveText(aText: string, aContext?: object | null, aDefault?: any, aTimeout?: number | null): Promise<string>;
    static resolveText(aConfiguration: {
        text: string;
        context?: object | null;
        defaultValue?: any;
        timeout?: number | null;
    }): Promise<string>;
    /**
     * Builds a resolver over a filtered copy of the context.
     *
     * The filter is applied to the context only, never to the globals, so this is a way to hand
     * over a cleaned context and not a sandbox.
     *
     * `option` carries the filter's own `deep` together with the constructor options `name`,
     * `parent` and `executer`, which are handed on as they are.
     *
     * @static
     * @param {object} arg the filter arguments, plus the whole constructor option set
     * @param {object} arg.context the object to copy; it is left untouched
     * @param {(name: string, value: *, holder: object) => boolean} arg.propFilter called with name,
     * value and the object holding it for every enumerable property, inherited ones included; a
     * property it answers false for is left out of the copy
     * @param {object} [arg.option={ deep: true, name: null, parent: null, executer: null }]
     * @param {boolean} [arg.option.deep=true] filters sub objects as well
     * @param {?string} [arg.option.name=null]
     * @param {?ExpressionResolver} [arg.option.parent=null]
     * @param {?(string|Executer)} [arg.option.executer=null]
     * @returns {ExpressionResolver}
     * @throws {TypeError} where a constructor option is of the wrong kind, as the constructor throws
     */
    static buildFiltered({ context, propFilter, option }: {
        context: object;
        propFilter: (name: string, value: any, holder: object) => boolean;
        option?: {
            deep?: boolean;
            name?: string | null;
            parent?: ExpressionResolver | null;
            executer?: (string | Executer) | null;
        };
    }): ExpressionResolver;
    /**
     * The former name of `buildFiltered`. It promised a security the method does not give.
     *
     * @deprecated use `buildFiltered`
     * @static
     * @param {Parameters<typeof ExpressionResolver.buildFiltered>[0]} arg the arguments of
     * `buildFiltered`
     * @returns {ExpressionResolver}
     */
    static buildSecure(arg: Parameters<typeof ExpressionResolver.buildFiltered>[0]): ExpressionResolver;
}
