import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { capabilityIt } from "../../ExecuterCapabilities.js";

/**
 * The sections of SPECIFICATION.md this suite opens. Held against the catalogue by
 * test/general/RuleGroupTest.js: 8.2 is declared `both` - the registration half is general.
 */
export const SECTIONS = ["8.2","8.3"];

/**
 * SPECIFICATION.md 8.3 - what an executer decides for itself, asked of one executer.
 *
 * Four of these are capabilities and are written through `capabilityIt`, so the catalogue decides
 * whether a case runs as `it` or as `it.fails`. What an executer answers *instead*, where that is
 * known and worth pinning, sits as an ordinary positive test in that executer's own directory.
 *
 * The dialect is the exception: it is not a yes or no, so it is no row of the catalogue but the
 * `variableName` of the executer entry. Both of its cases are here, branched on that function, so
 * neither spelling can quietly stop being true.
 *
 * @param {{name: string, variableName: Function}} anExecuterEntry an entry of EXECUTERS
 */
export const executerRules = ({ name: executer, variableName }) => {

	describe(`Specification 8.3 - what this executer decides for itself [${executer}]`, () => {

		it("addresses a context value the way its own dialect spells it", async () => {
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from context");
		});

		// Asked through resolveText, because a bare name is a ReferenceError under the executer that
		// demands a prefix and resolve lets that through (7) - what is pinned here is the dialect,
		// not the error policy. The expression stands as written, which is what a failing statement
		// does in a text.
		const spellsBareName = variableName("value") === "value";
		it(`${spellsBareName ? "answers" : "does not answer"} a bare context name`, async () => {
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolveText("${ value }");
			expect(result).toBe(spellsBareName ? "from context" : "${ value }");
		});

		capabilityIt("global/reachable", executer)("reaches a global that no link carries", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const result = await resolver.resolveText("${ Math.round(1.5) }");
			expect(result).toBe("2");
		});

		// The other side of the same freedom: however an executer reaches the global object, a name
		// the context carries is answered from the context. Carried over from test/ExecuterTests/,
		// where two executers pinned it against a name planted on the global object.
		it("answers from the context where the global object carries the same name", async () => {
			const name = `probe_${executer.replace(/-/g, "_")}`;
			globalThis[name] = "from global";
			try {
				const resolver = new ExpressionResolver({ context: { [name]: "from context" }, name: "root", executer });
				expect(await resolver.resolve(`\${${variableName(name)}}`)).toBe("from context");
			} finally {
				delete globalThis[name];
			}
		});

		capabilityIt("context/write-back", executer)("makes an assignment to a key the context carries readable afterwards", async () => {
			const variableNameKnown = variableName("known");
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			await resolver.resolveText(`\${${variableNameKnown} = "after"}`);
			expect(resolver.getData("known")).toBe("after");
		});

		// A template literal inside the statement. It is a rule - every executer has to reach the
		// context through one - and it is a branch of its own in the esprima executer, which walks
		// into the expressions of the literal to rewrite the identifiers there. Carried over from
		// test/ExecuterTests/; without it that branch is the only line of the rewrite nothing runs.
		it("reads a context value from inside a template literal", async () => {
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolve(`\${ \`a\${${variableNameValue}}b\` }`);
			expect(result).toBe("afrom contextb");
		});

		// A context value is reached from inside a nested function - a callback is not an exotic
		// thing to write in an expression. Three executers put the context into scope, into the
		// parameter list or hand it over as an object, and a nested function closes over any of
		// those; the AST rewrite of the esprima executer only sees the identifiers of the statement
		// itself. See BACKLOG.md.
		capabilityIt("context/nested-function", executer)("reaches a context value from inside a nested function", async () => {
			const variableNameCount = variableName("count");
			const resolver = new ExpressionResolver({ context: { count: 3 }, name: "root", executer });
			const result = await resolver.resolve(`\${ [1, 2].map((value) => value + ${variableNameCount}).join() }`);
			expect(result).toBe("4,5");
		});
	});

	describe(`Specification 8.2 - what this implementation can execute [${executer}]`, () => {

		capabilityIt("statement/assignment", executer)("executes an assignment as a statement", async () => {
			const variableNameKnown = variableName("known");
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			const result = await resolver.resolveText(`\${${variableNameKnown} = "after"}`);
			expect(result).toBe("after");
		});
	});
};
