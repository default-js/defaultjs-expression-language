import { describe, it, expect } from "vitest";
import { CAPABILITIES, EXECUTERS, YES, NO } from "../ExecuterCapabilities.js";

/**
 * The capability catalogue holds itself to its own shape.
 *
 * It does not run any case - the cases are ordinary tests in the capability files, which is the point
 * of the rebuild on 2026-09-01. What is checked here is that the table stays a table: every row as
 * wide as the header, every cell one of the two states, no capability standing empty, and every one
 * of them naming the section it is read against.
 *
 * **A case whose name is no row of the table cannot pass unnoticed** - `capabilityState` throws, so
 * the capability file fails loudly. The other direction, a row no case reads any more, is not
 * checkable from here: Vitest isolates each file, so this one cannot see which rows the capability
 * files looked up. It shows up the moment someone reads the table, which is what a table is for.
 *
 * The checks that policed the third state are gone with it (2026-09-05): `defect` had to be
 * accompanied by a `yes` elsewhere in its row and could not share a row with `no`. Neither question
 * exists once nothing an executer does can break a rule.
 */

const STATES = [YES, NO];

describe("The capability catalogue", () => {

	it("gives every row one cell per executer", async () => {
		const wrong = [];
		for (const [capability, { cases }] of Object.entries(CAPABILITIES))
			for (const [name, row] of Object.entries(cases)) if (row.length !== EXECUTERS.length) wrong.push(`${capability}/${name}`);

		expect(wrong.join(", ")).toBe("");
	});

	it("fills every cell with one of the two states", async () => {
		const wrong = [];
		for (const [capability, { cases }] of Object.entries(CAPABILITIES))
			for (const [name, row] of Object.entries(cases))
				for (const state of row) if (!STATES.includes(state)) wrong.push(`${capability}/${name}: ${state}`);

		expect(wrong.join(", ")).toBe("");
	});

	it("holds no empty capability", async () => {
		const empty = Object.entries(CAPABILITIES)
			.filter(([, { cases }]) => Object.keys(cases).length === 0)
			.map(([capability]) => capability);

		expect(empty.join(", ")).toBe("");
	});

	// The section is what a reader follows from a row back to the rule it was read against, and
	// `SPECIFICATION.md` 8.3 is written from this table by hand - a capability without one leaves the
	// person doing that writing guessing.
	it("names the specification section of every capability", async () => {
		const nameless = Object.entries(CAPABILITIES)
			.filter(([, capability]) => !capability.specification || !capability.description)
			.map(([capability]) => capability);

		expect(nameless.join(", ")).toBe("");
	});
});
