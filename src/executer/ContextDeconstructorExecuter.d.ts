import Executer from "../Executer.js";
/** The name this executer is registered under, and the default executer. */
export declare const EXECUTERNAME = "context-deconstruction-executer";
/**
 * Switches the logging of every function this executer generates to the console.
 *
 * @param {boolean} value
 */
export declare const setDebug: (value: boolean) => void;
/**
 * Configures the code cache of this executer. `size` is the only option
 * today; an option left out changes nothing.
 *
 * @param {import('../CodeCache.js').CodeCacheOptions} [options]
 * @throws {TypeError} where the size is not a finite number
 */
export declare const setupExecuter: (options?: import('../CodeCache.js').CodeCacheOptions) => void;
/**
 * The executer: destructures the context into the parameters of a generated function, so a
 * statement addresses a context value by its bare name - see `README.md`.
 * Registered under `EXECUTERNAME` on import.
 *
 * @type {Executer}
 */
declare const EXECUTER: Executer;
export default EXECUTER;
