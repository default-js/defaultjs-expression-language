/**
 * The interface every executer implements. An executer runs statements and
 * holds no context of its own: the context always comes from the resolver.
 *
 * An own implementation is built from it by handing over the function that does the work.
 *
 * @export
 * @class Executer
 */
export default class Executer{

	#execution;

	/**
	 * @param {Object} [option]
	 * @param {(aStatement: string, aContext: object) => *} [option.execution] runs a statement over
	 * a context and answers the result, a promise included. Without one, every execution throws.
	 */
	constructor({execution} = {}){
		this.#execution = execution || (() => {throw new Error("not implemented")});
	}

	/**
	 * Runs a statement over a context.
	 *
	 * @param {string} aStatement the statement, without delimiters and scope prefix
	 * @param {object} aContext the context of the resolver the statement is evaluated on
	 * @returns {*} what the execution answers, a promise included
	 */
	execute(aStatement, aContext){
		return this.#execution(aStatement, aContext);
	}
};
