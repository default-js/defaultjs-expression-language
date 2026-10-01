import Executer from "./Executer.js";

const EXECUTERS = new Map();

/**
 * Keeps an executer under a name, so a resolver can be given the name instead of the instance -
 * SPECIFICATION.md 9.1. An executer already kept under the name is replaced.
 *
 * @param {string} aName
 * @param {Executer} anExecuter
 */
export const register = (aName, anExecuter) => {
	EXECUTERS.set(aName, anExecuter);
};

/**
 * The executer kept under a name - SPECIFICATION.md 9.1. Also the default export of this module.
 *
 * @param {string} aName
 * @returns {Executer}
 * @throws {Error} where no executer is kept under the name
 */
export const getExecuter = (aName) => {
	const executer = EXECUTERS.get(aName);
	if (!executer) throw new Error(`Executer "${aName}" is not registered!`);
	return executer;
};

export default getExecuter;
