import Executer from "../src/Executer.js";

/**
 * The executer the suite owns: it evaluates nothing. It answers the statement it was handed, or,
 * built with a function, what that function answers for `(aStatement, aContext)`.
 */
export default class TestExecuter extends Executer {
	/**
	 * @param {Function} [anAnswer]
	 */
	constructor(anAnswer = (aStatement) => aStatement) {
		super({ execution: anAnswer });
	}
}
