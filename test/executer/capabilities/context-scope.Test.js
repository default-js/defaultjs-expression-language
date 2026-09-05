import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * Capability `context-scope` - whether a construct carrying a context name still reaches that value.
 * Read against SPECIFICATION.md 8.3.
 *
 * The second of the two questions this catalogue asks about every construct: `syntax` asks whether it
 * runs, with constants inside it; this file asks whether the same construct still sees the context.
 * That is the question which separates the four implementations, and until 2026-09-05 nobody asked
 * it - the cases of 3.4 put constants inside their literals.
 *
 * The dialect is no row: it is not a yes or no but a spelling, carried as `variableName` on the
 * executer entry. The case that pins it has a fixed name (the catalogue key) and a branched
 * expectation, so that neither spelling can quietly stop being true.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the catalogue, and the catalogue decides whether it has to pass
	const capabilityIt = casesOf("context-scope", executer);

	describe(`Capability context-scope - reaching a context value [${executer}]`, () => {

		capabilityIt("evaluates an operator expression over the context", async () => {
			const resolver = new ExpressionResolver({ context: { a: 6, b: 7 }, name: "root", executer });
			const result = await resolver.resolve(`\${ ${variableName("a")} * ${variableName("b")} }`);
			expect(result).toBe(42);
		});

		capabilityIt("evaluates a call on a context member", async () => {
			const resolver = new ExpressionResolver({ context: { value: "text" }, name: "root", executer });
			const result = await resolver.resolve(`\${ ${variableName("value")}.toUpperCase() }`);
			expect(result).toBe("TEXT");
		});

		// The promise comes from the context, not from `Promise.resolve` in the statement: whether a
		// global is reachable is `global-scope`. This one is about `await` alone.
		capabilityIt("evaluates an await inside the statement", async () => {
			const resolver = new ExpressionResolver({ context: { promised: Promise.resolve(20) }, name: "root", executer });
			expect(await resolver.resolve(`\${ await ${variableName("promised")} + 1 }`)).toBe(21);
		});

		capabilityIt("addresses a context value the way its own dialect spells it", async () => {
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from context");
		});

		// Asked through resolveText, because a bare name is a ReferenceError under the executer that
		// demands a prefix and resolve lets that through (7) - what is pinned here is the dialect, not
		// the error policy. The expression stands as written, which is what a failing statement does
		// in a text. The case name is fixed because it is the key of the catalogue row; what differs
		// is the answer, and that is read from the dialect rather than from the table.
		const spellsBareName = variableName("value") === "value";
		capabilityIt("answers a bare context name only where that is its dialect", async () => {
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolveText("${ value }");
			expect(result).toBe(spellsBareName ? "from context" : "${ value }");
		});

		// A template literal inside the statement, this time carrying a context name - the constant
		// form is a case of `syntax`. It is a branch of its own in the esprima executer, which walks
		// into the expressions of the literal to rewrite the identifiers there.
		capabilityIt("reads a context value from inside a template literal", async () => {
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolve(`\${ \`a\${${variableNameValue}}b\` }`);
			expect(result).toBe("afrom contextb");
		});

		// However an executer reaches the global object - and whether it reaches it at all is
		// `global-scope` - a name the context carries is answered from the context.
		capabilityIt("answers from the context where the global object carries the same name", async () => {
			const probe = `probe_${executer.replace(/-/g, "_")}`;
			globalThis[probe] = "from global";
			try {
				const resolver = new ExpressionResolver({ context: { [probe]: "from context" }, name: "root", executer });
				expect(await resolver.resolve(`\${${variableName(probe)}}`)).toBe("from context");
			} finally {
				delete globalThis[probe];
			}
		});

		// A callback is an ordinary thing to write in an expression. The esprima rewrite skips
		// function bodies whole, and BACKLOG.md carries the six further shapes the same rewrite
		// misses - an object literal, an array literal, a ternary, a computed key among them.
		capabilityIt("reaches a context value from inside a nested function", async () => {
			const resolver = new ExpressionResolver({ context: { count: 3 }, name: "root", executer });
			const result = await resolver.resolve(`\${ [1, 2].map((value) => value + ${variableName("count")}).join() }`);
			expect(result).toBe("4,5");
		});
	});
}
