import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { capabilityIt } from "../../ExecuterCapabilities.js";

/**
 * The sections of SPECIFICATION.md this suite opens. Held against the catalogue by
 * test/general/RuleGroupTest.js: 6.1 and 6.5 are declared `both`, so their other half runs in test/spec/.
 */
export const SECTIONS = ["6.1","6.2","6.3","6.5"];

/**
 * SPECIFICATION.md 6.1 (through a statement), 6.2, 6.3 and the negative guarantee of 6.5, for one
 * executer.
 *
 * Every executer reads the context in its own way - the deconstruction one reads all its names
 * before it runs a statement - so a rule about what the context answers has to be asked of each of
 * them. What the proxy does without a statement in play, the global object as a context object, the
 * four data methods and `buildSecure` are resolver API and stay in the general suite.
 *
 * The negative guarantee of 6.5 is a rule every executer has to keep, and two of them do not keep
 * it today. Which ones is read from the catalogue rather than written here, so the state stands in
 * one place; the fix is carried in `BACKLOG.md`.
 *
 * @param {{name: string, variableName: Function}} anExecuterEntry an entry of EXECUTERS
 */
export const contextRules = ({ name: executer, variableName }) => {

	describe(`Specification 6.1 - every access goes through the proxy [${executer}]`, () => {

		it("resolves over a context the caller froze", async () => {
			const resolver = new ExpressionResolver({ context: Object.freeze({ own: "frozen" }), name: "solo", executer });
			expect(await resolver.resolve(`\${ ${variableName("own")} }`)).toBe("frozen");
		});

		// A context may carry any key. The resolver filters none of them since 2026-08-30, so an
		// executer that turns names into code has to skip what it cannot express instead of
		// failing over it - see DECISIONS.md. Carried over from test/ExecuterTests/, where three
		// of the four executers pinned this separately as "illegal object member".
		it("resolves over a context carrying a key that is not a variable name", async () => {
			const context = { known: "from context" };
			context["not-a-name"] = true;
			const resolver = new ExpressionResolver({ context, name: "root", executer });
			expect(await resolver.resolve(`\${${variableName("known")}}`)).toBe("from context");
		});
	});

	describe(`Specification 6.2 - names are a snapshot, values are live [${executer}]`, () => {

		it("does not see a key added to the handed-in object after the resolver was built", async () => {
			const variableNameAdded = variableName("added");
			const handed = { known: 1 };
			const resolver = new ExpressionResolver({ context: handed, name: "root", executer });
			handed.added = 2;
			const result = await resolver.resolve(`\${typeof ${variableNameAdded}}`);
			expect(result).toBe("undefined");
		});

		it("sees that key after resetCache", async () => {
			const variableNameAdded = variableName("added");
			const handed = { known: 1 };
			const resolver = new ExpressionResolver({ context: handed, name: "root", executer });
			handed.added = 2;
			resolver.contextHandle.resetCache();
			const result = await resolver.resolve(`\${${variableNameAdded}}`, "fallback");
			expect(result).toBe(2);
		});

		it("reads a value at the moment of the lookup, so a mutation is visible immediately", async () => {
			const variableNameHolder = variableName("holder");
			const handed = { holder: { name: "before" } };
			const resolver = new ExpressionResolver({ context: handed, name: "root", executer });
			handed.holder.name = "after";
			const result = await resolver.resolve(`\${${variableNameHolder}.name}`, "fallback");
			expect(result).toBe("after");
		});

		it("keeps the set of names in step when a value is written through the resolver", async () => {
			const variableNameFresh = variableName("fresh");
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			resolver.updateData("fresh", 2);
			const result = await resolver.resolve(`\${${variableNameFresh}}`, "fallback");
			expect(result).toBe(2);
		});
	});

	describe(`Specification 6.3 - a link without a context [${executer}]`, () => {

		it("contributes nothing to a lookup and is passed through", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const middle = new ExpressionResolver({ context: null, name: "middle", parent: root, executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: middle, executer });
			const result = await leaf.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from root");
		});

		it("gains content like any other link", async () => {
			const variableNameValue = variableName("value");
			const root = new ExpressionResolver({ context: { value: "from root" }, name: "root", executer });
			const middle = new ExpressionResolver({ context: null, name: "middle", parent: root, executer });
			const leaf = new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: middle, executer });
			middle.mergeContext({ value: "from middle" });
			const result = await leaf.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from middle");
		});
	});

	describe(`Specification 6.5 - no write from an expression reaches the global object [${executer}]`, () => {

		// with-scoped lets an assignment to an unknown name fall out of the `with` block into global
		// scope, and the deconstructor executer generates a sloppy-mode body where an undeclared
		// assignment does the same. The other two keep the guarantee already - context-object writes
		// through the proxy, esprima rewrites the identifier onto the context object.
		//
		// The switch is off by default, so this is the guarantee as it stands out of the box. The
		// leak is read and cleaned up before the assertion, because a test marked fails stops at the
		// assertion and would otherwise leave the name on globalThis for every later test.
		capabilityIt("context/no-global-write", executer)("does not create a global for a name no link carries", async () => {
			const leakName = `leaked_${executer.replace(/-/g, "_")}`;
			const variableNameLeak = variableName(leakName);
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			await resolver.resolveText(`\${${variableNameLeak} = 1}`);
			const leaked = leakName in globalThis;
			delete globalThis[leakName];
			expect(leaked).toBe(false);
		});
	});
};
