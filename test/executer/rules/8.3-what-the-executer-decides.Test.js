import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 8.3 - what an executer decides for itself, asked of every executer.
 *
 * Every case here has a row in `MATRIX`, which decides whether an implementation has to pass it:
 * some of them hold under all four, two are freedoms the section grants, and one is a rule the
 * esprima rewrite does not keep.
 *
 * The dialect is the exception that is neither - a spelling is no yes or no. It stays as
 * `variableName` on the executer entry, and the case that pins it carries a fixed name (the matrix
 * key) with a branched expectation, so that neither spelling can quietly stop being true.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the matrix, and the matrix decides whether it has to pass
	const matrixIt = casesOf("8.3", executer);

	describe(`Specification 8.3 - what this executer decides for itself [${executer}]`, () => {

		matrixIt("addresses a context value the way its own dialect spells it", async () => {
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from context");
		});

		// Asked through resolveText, because a bare name is a ReferenceError under the executer that
		// demands a prefix and resolve lets that through (7) - what is pinned here is the dialect,
		// not the error policy. The expression stands as written, which is what a failing statement
		// does in a text.
		// The case name is fixed because it is the key of the matrix row; what differs is the answer,
		// and that is read from the dialect rather than from the table - a spelling is no yes or no.
		const spellsBareName = variableName("value") === "value";
		matrixIt("answers a bare context name only where that is its dialect", async () => {
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolveText("${ value }");
			expect(result).toBe(spellsBareName ? "from context" : "${ value }");
		});

		// However an executer reaches the global object - and whether it reaches it at all is a
		// capability - a name the context carries is answered from the context. That part is a rule,
		// so it stands here. Carried over from test/ExecuterTests/, where two executers pinned it
		// against a name planted on the global object.
		matrixIt("answers from the context where the global object carries the same name", async () => {
			const probe = `probe_${executer.replace(/-/g, "_")}`;
			globalThis[probe] = "from global";
			try {
				const resolver = new ExpressionResolver({ context: { [probe]: "from context" }, name: "root", executer });
				expect(await resolver.resolve(`\${${variableName(probe)}}`)).toBe("from context");
			} finally {
				delete globalThis[probe];
			}
		});

		// Reached through `window` rather than bare. Every executer answers this, including the one
		// that cannot reach a bare `Math` - `window` is one of the identifiers its rewrite leaves
		// alone - so it is a rule and not that executer's own behaviour. Verified against all four on
		// 2026-09-01 before it was moved here out of esprima-executer/OwnBehaviourTest.js.
		matrixIt("reaches a global through window", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolveText("${ window.Math.round(1.5) }")).toBe("2");
		});

		// A freedom of 8.3: where the executer does not reach the global, the statement raises and
		// the expression stands as written (7) - a different answer, not an error the caller sees.
		matrixIt("reaches a global that no resolver carries", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolveText("${ Math.round(1.5) }")).toBe("2");
		});

		// A callback is an ordinary thing to write in an expression, and 8.3 lets an executer decide
		// how a statement reaches a context value - not to lose it halfway through the statement.
		matrixIt("reaches a context value from inside a nested function", async () => {
			const resolver = new ExpressionResolver({ context: { count: 3 }, name: "root", executer });
			const result = await resolver.resolve(`\${ [1, 2].map((value) => value + ${variableName("count")}).join() }`);
			expect(result).toBe("4,5");
		});

		// A template literal inside the statement. It is a rule - every executer has to reach the
		// context through one - and it is a branch of its own in the esprima executer, which walks
		// into the expressions of the literal to rewrite the identifiers there. Carried over from
		// test/ExecuterTests/; without it that branch is the only line of the rewrite nothing runs.
		matrixIt("reads a context value from inside a template literal", async () => {
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolve(`\${ \`a\${${variableNameValue}}b\` }`);
			expect(result).toBe("afrom contextb");
		});

	});
}
