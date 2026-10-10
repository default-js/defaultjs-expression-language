import Executer from "../Executer.js";
/** The name this executer is registered under. */
export declare const EXECUTERNAME = "context-object-executer";
/**
 * Configures this executer: the size of its code cache and the name a statement addresses the
 * context by. An option left out changes nothing.
 *
 * @param {object} [options]
 * @param {number} [options.size] the size of the code cache, as `CodeCacheOptions` describes it in
 * `CodeCache.js`
 * @param {?string} [options.contextVar] the name a statement addresses the context by, `ctx` until it
 * is set, taken trimmed. It holds for every statement this executer runs from then on, whichever
 * resolver hands it over. Null, undefined and a string that is empty after trimming leave the name
 * as it is. A name that cannot be a parameter name is not rejected here: every statement then
 * throws a `SyntaxError`.
 * @throws {TypeError} where the size is not a finite number, or the name is neither a string nor
 * null or undefined
 */
export declare const setupExecuter: (options?: {
    size?: number;
    contextVar?: string | null;
}) => void;
/**
 * The name a statement addresses the context by: `ctx`, or the one `setupExecuter` set last.
 *
 * @returns {string}
 */
export declare const getContextVar: () => string;
/**
 * The executer: hands the context over as one object named `ctx`, or the name `setupExecuter` sets,
 * so a statement addresses a context value as `ctx.value` - see `README.md`. Registered under
 * `EXECUTERNAME` on import.
 *
 * @type {Executer}
 */
declare const EXECUTER: Executer;
export default EXECUTER;
