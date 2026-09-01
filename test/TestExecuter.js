import { beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import { ExpressionResolver } from "../index.js";
import Executer from "../src/Executer.js";
import { registrate } from "../src/ExecuterRegistry.js";

/**
 * The executer the suite owns, for the tests that are about the **resolver**.
 *
 * `test/spec/` pins what ExpressionResolver does: where an expression begins and ends, which
 * resolver of the chain answers, what the entry points make of a result, what the data methods do.
 * None of that is the business of an implementation - so none of it is tested through one.
 *
 * **It evaluates nothing.** It answers the statement it was handed, unchanged. That is the whole
 * implementation, and it is what makes a case say one thing:
 *
 * ```javascript
 * const result = await ExpressionResolver.resolveText("a ${ {v: 2}.v } b", {});
 * expect(result).toBe("a {v: 2}.v b");
 * ```
 *
 * The answer is the statement, so the text shows exactly what the resolver delimited - and nothing
 * about anybody's ability to evaluate it. That `{v: 2}.v` also *evaluates* to `2` is a rule of 3.4
 * and belongs to the implementations, where it is asked of all four against the matrix.
 *
 * **`answerWith`** sets a different answer for one case. The rules that need it are the ones about
 * what the resolver does *with* a result: the default value replaces `null` (4.4), a promise is
 * awaited (4.6), a type survives `resolve` (4.3), an error reaches the caller (7). Each of those is
 * then independent of anyone producing the value.
 *
 * **`statements()`** answers what was handed over, in order - for the rules the answer cannot show:
 * that a statement arrived not at all (an escaped expression, 3.2), or how often (every occurrence
 * on its own, 4.3).
 *
 * Both are cleared after every case by `useTestExecuter()`, so no case inherits the state of the one
 * before it.
 *
 * It is deliberately not registered by `src/executer/index.js`, never becomes a default outside a
 * test file, and no benchmark uses it.
 */

export const EXECUTERNAME = "test-executer";

const STATEMENTS = [];
let ANSWER = null;

/**
 * The statements handed to this executer during the running case, in the order they arrived.
 *
 * @returns {string[]}
 */
export const statements = () => [...STATEMENTS];

/**
 * Answers `aFunction(aStatement, aContext)` instead of the statement, for the running case.
 *
 * @param {Function} aFunction
 */
export const answerWith = (aFunction) => {
	ANSWER = aFunction;
};

/**
 * Answers the value the context carries under the statement, for every case of one file - a
 * lookup, not an evaluation. That is what a rule about **which resolver of the chain answers**
 * needs: the statement stays the key, and what comes back shows whose context was handed over.
 *
 * Called at the top level of a test file. `answerWith` still overrides it for a single case.
 */
export const answersFromContext = () => {
	beforeEach(() => {
		answerWith((aStatement, aContext) => aContext[aStatement]);
	});
};

/** Forgets the record and any answer set through `answerWith`. Runs after every case. */
export const reset = () => {
	STATEMENTS.length = 0;
	ANSWER = null;
};

const EXECUTER = new Executer({
	defaultContext: {},
	execution: (aStatement, aContext) => {
		STATEMENTS.push(aStatement);

		return ANSWER ? ANSWER(aStatement, aContext) : aStatement;
	}
});

/**
 * Makes this executer the default for one test file, and puts the previous one back afterwards.
 *
 * The static entry points of 4.1 take no executer - they use `ExpressionResolver.defaultExecuter` -
 * so a file that pins them has to move the default rather than pass an option. A file that only
 * builds resolvers itself can pass the executer instead, since 2026-09-01 as an instance.
 *
 * Vitest isolates each file in its own iframe, so the moved default stays inside the file that
 * calls this. Called at the top level of a test file, before its describes.
 */
export const useTestExecuter = () => {
	const previous = ExpressionResolver.defaultExecuter;

	beforeAll(() => {
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
	});

	afterEach(() => {
		reset();
	});

	afterAll(() => {
		ExpressionResolver.defaultExecuter = previous;
	});
};

registrate(EXECUTERNAME, EXECUTER);

export default EXECUTER;
