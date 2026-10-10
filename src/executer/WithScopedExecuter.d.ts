import Executer from "../Executer.js";
/** The name this executer is registered under. */
export declare const EXECUTERNAME = "with-scoped-executer";
/**
 * Configures the code cache of this executer. `size` is the only option
 * today; an option left out changes nothing.
 *
 * @param {import('../CodeCache.js').CodeCacheOptions} [options]
 * @throws {TypeError} where the size is not a finite number
 */
export declare const setupExecuter: (options?: import('../CodeCache.js').CodeCacheOptions) => void;
/**
 * The executer: runs a statement inside a `with` block over the context, so a statement addresses a
 * context value by its bare name - see `README.md`. Registered under
 * `EXECUTERNAME` on import.
 *
 * @deprecated because `with` is; announces it on the first statement it runs
 * @type {Executer}
 */
declare const EXECUTER: Executer;
export default EXECUTER;
