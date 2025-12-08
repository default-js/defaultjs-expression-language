import Executer from "./Executer.js";

const EXECUTERS = new Map();

/**
 *
 * @param {string} aName
 * @param {Executer} anExecuter
 */
export const registrate = (aName, anExecuter) => {
	EXECUTERS.set(aName, anExecuter);
};

/**
 *
 * @param {string} aName
 * @returns {Executer}
 */
export const getExecuter = (aName) => {
	const executer = EXECUTERS.get(aName);
	if (!executer) throw new Error(`Executer "${aName}" is not registrated!`);
	return executer;
};

export default getExecuter;
