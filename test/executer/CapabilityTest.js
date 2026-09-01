import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS, CAPABILITIES, capabilityState, supports, UNIMPLEMENTED_RULE, YES } from "../ExecuterCapabilities.js";

/**
 * Every capability of the catalogue, asked of every executer.
 *
 * Nothing is decided here: the cases, their expectations and the state of each executer all come
 * from `test/ExecuterCapabilities.js`. This file only turns the table into tests - `yes` runs as
 * `it` and has to pass, `no` runs as `it.fails` and has to fail. There is no counter-test for the
 * `no` state anywhere, so a capability that arrives is one changed cell and a red gate, not a
 * search for the second place that said the opposite.
 *
 * The kind of a row is part of its name, because the two are not the same thing: a **capability**
 * is a freedom the specification grants, an **unimplemented rule** is a defect that `BACKLOG.md`
 * carries. Both run as a failing case where an executer does not have them; only one of them is
 * allowed to stay that way.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Capabilities [${executer}]`, () => {

		for (const capability of CAPABILITIES) {
			const state = capabilityState(capability.id, executer);
			const pin = state === YES ? it : it.fails;
			const kind = capability.kind === UNIMPLEMENTED_RULE ? "rule, not kept yet" : "capability";

			pin(`${capability.spec} ${capability.id} (${kind}, ${state}): ${capability.description}`, async () => {
				const resolver = new ExpressionResolver({ context: capability.context(), name: "root", executer });
				const answer = await capability.run(resolver, variableName, executer);
				expect(answer).toBe(capability.expected);
			});
		}
	});
}

describe("Capabilities - the catalogue itself", () => {

	// A row without a case decides nothing, and a case without a row cannot be asked. Both would
	// pass unnoticed, because the generator above simply produces fewer tests.
	it("holds a case and a state for every capability", async () => {
		const broken = CAPABILITIES.filter((capability) => {
			const hasCase = typeof capability.run === "function" && typeof capability.context === "function" && "expected" in capability;
			const hasState = EXECUTERS.every(({ name }) => {
				try {
					capabilityState(capability.id, name);
					return true;
				} catch {
					return false;
				}
			});

			return !(hasCase && hasState);
		});

		expect(broken.map(({ id }) => id).join(", ")).toBe("");
	});

	// `supports` is what the rules files ask; it has to agree with the table the cases are generated
	// from, or a rule file and this file would disagree about the same executer.
	it("answers supports in step with the matrix", async () => {
		const disagreeing = [];
		for (const { id } of CAPABILITIES)
			for (const { name } of EXECUTERS) if (supports(id, name) !== (capabilityState(id, name) === YES)) disagreeing.push(`${id}/${name}`);

		expect(disagreeing.join(", ")).toBe("");
	});
});
