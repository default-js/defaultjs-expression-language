import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 3.4 - a statement is arbitrary JavaScript, asked of every executer.
 *
 * "Arbitrary JavaScript" is a demand on the implementations: whatever a statement may contain, the
 * one running it has to cope with. Until 2026-09-01 these cases sat in `test/spec/` and in 3.1,
 * where they were asked of one executer and shared a case with the delimiting - so a broken scanner
 * and an implementation that cannot evaluate an object literal looked the same. The delimiting is
 * pinned in `test/spec/3.1-delimiters.Test.js` now, against an executer that evaluates nothing.
 *
 * What is *not* here: the empty statement, which never reaches an executer, and `${}` as a whole -
 * both are 3.4 as far as the resolver is concerned and stay in the general suite.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the matrix, and the matrix decides whether it has to pass
	const matrixIt = casesOf("3.4", executer);

	describe(`Specification 3.4 - a statement is arbitrary JavaScript [${executer}]`, () => {

		matrixIt("evaluates an operator expression over the context", async () => {
			const resolver = new ExpressionResolver({ context: { a: 6, b: 7 }, name: "root", executer });
			const result = await resolver.resolve(`\${ ${variableName("a")} * ${variableName("b")} }`);
			expect(result).toBe(42);
		});

		matrixIt("evaluates a call on a context member", async () => {
			const resolver = new ExpressionResolver({ context: { value: "text" }, name: "root", executer });
			const result = await resolver.resolve(`\${ ${variableName("value")}.toUpperCase() }`);
			expect(result).toBe("TEXT");
		});

		matrixIt("evaluates an object literal", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ {a: 4}.a }")).toBe(4);
		});

		matrixIt("evaluates an arrow function body", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ (() => { return 3; })() }")).toBe(3);
		});

		matrixIt("evaluates a template literal", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ `a${1 + 1}b` }")).toBe("a2b");
		});

		matrixIt("evaluates a regular expression literal", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ /}/.source }")).toBe("}");
		});

		// The promise comes from the context, not from `Promise.resolve` in the statement: whether a
		// global is reachable is a different question and has its own row (8.3). This one is about
		// `await` alone.
		matrixIt("evaluates an await inside the statement", async () => {
			const resolver = new ExpressionResolver({ context: { promised: Promise.resolve(20) }, name: "root", executer });
			expect(await resolver.resolve(`\${ await ${variableName("promised")} + 1 }`)).toBe(21);
		});
	});
}
