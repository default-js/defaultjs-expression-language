export type NameCache = {
    has: (key: string | symbol) => boolean;
    get: (key: string | symbol) => (ResolverContextHandle | undefined);
    set: (key: string | symbol, value: ResolverContextHandle) => any;
    delete: (key: string | symbol) => boolean;
    keys: () => Iterable<string | symbol>;
};
/**
 * What stands behind the context of one resolver: the object handed to it, the handle of its parent,
 * and the name cache that tells which names this resolver provides. It hands out the context an
 * expression sees, a proxy that answers for the whole chain.
 *
 * Internal to the package: index.js does not export it.
 *
 * @export
 * @class ResolverContextHandle
 */
export default class ResolverContextHandle {
    #private;
    /**
     * @constructor
     * @param {?object} context the object the caller handed over, kept rather than copied. Where none
     * is passed, the handle holds no object at all and carries no name, not even one of
     * Object.prototype. It gets an object on the first write.
     * @param {?ResolverContextHandle} parent the handle of the parent resolver
     */
    constructor(context: object | null, parent: ResolverContextHandle | null);
    /**
     * The context an expression sees: a proxy that answers for the whole chain, or over the global
     * object the global object itself.
     *
     * @type {object}
     */
    get context(): object;
    /**
     * @type {ResolverContextHandle|null}
     */
    get parent(): ResolverContextHandle | null;
    /**
     * Whether this handle provides the name itself. Every name of its own context counts, the ones
     * inherited through the prototype chain included; a handle over the global object
     * provides every name.
     *
     * @param {string|symbol} key
     * @returns {boolean}
     */
    hasName(key: string | symbol): boolean;
    /**
     * Whether this handle provides a context: one was handed to the constructor, or a value has been
     * written since. What the data holds decides nothing.
     *
     * @type {boolean}
     */
    get providesContext(): boolean;
    /**
     * Assigns the keys of an object into the one this handle holds, key by key, creating that object
     * where there is none.
     *
     * @param {object} data
     * @throws {TypeError} where the object held refuses a key - the keys before it are written by then
     */
    mergeData(data: object): void;
    /**
     * Takes up the keys added to the handed-in object since the handle was built, which are not
     * provided until then.
     */
    resetCache(): void;
}
