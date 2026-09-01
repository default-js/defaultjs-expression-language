import { describe, it, expect } from "vitest";
import { MATRIX, EXECUTERS, YES, NO, DEFECT } from "../ExecuterCapabilities.js";

/**
 * The matrix holds itself to its own shape.
 *
 * It does not run any case - the cases are ordinary tests in the section files, which is the point
 * of the rebuild on 2026-09-01. What is checked here is that the table stays a table: every row as
 * wide as the header, every cell one of the three states, no section standing empty.
 *
 * **A case whose name is no row of the table cannot pass unnoticed** - `matrixState` throws, so the
 * section file fails loudly. The other direction, a row no case reads any more, is not checkable
 * from here: Vitest isolates each file, so this one cannot see which rows the section files looked
 * up. It shows up the moment someone reads the table, which is what a table is for.
 */

const STATES = [YES, NO, DEFECT];

describe("The matrix", () => {

	it("gives every row one cell per executer", async () => {
		const wrong = [];
		for (const [section, cases] of Object.entries(MATRIX))
			for (const [name, row] of Object.entries(cases)) if (row.length !== EXECUTERS.length) wrong.push(`${section}/${name}`);

		expect(wrong.join(", ")).toBe("");
	});

	it("fills every cell with one of the three states", async () => {
		const wrong = [];
		for (const [section, cases] of Object.entries(MATRIX))
			for (const [name, row] of Object.entries(cases))
				for (const state of row) if (!STATES.includes(state)) wrong.push(`${section}/${name}: ${state}`);

		expect(wrong.join(", ")).toBe("");
	});

	it("holds no empty section", async () => {
		const empty = Object.entries(MATRIX)
			.filter(([, cases]) => Object.keys(cases).length === 0)
			.map(([section]) => section);

		expect(empty.join(", ")).toBe("");
	});

	// A `defect` says "the specification demands this and this implementation does not keep it". If
	// no implementation keeps it, the row is not a broken implementation but a rule nothing supports
	// - which is either a wrong expectation or a defect of the resolver, and in both cases it is not
	// what `defect` means.
	it("marks a defect only where another executer keeps the rule", async () => {
		const lonely = [];
		for (const [section, cases] of Object.entries(MATRIX))
			for (const [name, row] of Object.entries(cases)) if (row.includes(DEFECT) && !row.includes(YES)) lonely.push(`${section}/${name}`);

		expect(lonely.join(", ")).toBe("");
	});

	// `no` and `defect` are not the same claim, and a row must not make both at once: either the
	// specification grants the difference or it does not.
	it("does not call the same row a freedom and a defect", async () => {
		const both = [];
		for (const [section, cases] of Object.entries(MATRIX))
			for (const [name, row] of Object.entries(cases)) if (row.includes(NO) && row.includes(DEFECT)) both.push(`${section}/${name}`);

		expect(both.join(", ")).toBe("");
	});
});
