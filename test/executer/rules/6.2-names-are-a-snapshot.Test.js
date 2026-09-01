import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 6.2 - the names of a context are a snapshot, its values are read live, asked of
 * every executer.
 */

for (const { name: executer, variableName } of EXECUTERS) {

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
}
