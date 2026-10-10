import Executer from "./Executer.js";
/**
 * Keeps an executer under a name, so a resolver can be given the name instead of the instance.
 * An executer already kept under the name is replaced.
 *
 * @param {string} aName
 * @param {Executer} anExecuter
 */
export declare const register: (aName: string, anExecuter: Executer) => void;
/**
 * The executer kept under a name. Also the default export of this module.
 *
 * @param {string} aName
 * @returns {Executer}
 * @throws {Error} where no executer is kept under the name
 */
export declare const getExecuter: (aName: string) => Executer;
export default getExecuter;
