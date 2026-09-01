import { describe, it, expect } from "vitest";
import { RULE_GROUPS, GENERAL, PER_EXECUTER, BOTH, sectionsOf } from "../ExecuterCapabilities.js";
import { SECTIONS as CHAIN_SECTIONS } from "../executer/shared/ChainRules.js";
import { SECTIONS as CONTEXT_SECTIONS } from "../executer/shared/ContextRules.js";
import { SECTIONS as ERROR_SECTIONS } from "../executer/shared/ErrorRules.js";
import { SECTIONS as EXECUTER_SECTIONS } from "../executer/shared/ExecuterRules.js";

/**
 * The catalogue declares which group each rule of SPECIFICATION.md is tested in, and the shared
 * suites declare which sections they open. This file holds the two against each other.
 *
 * Without it the declaration would be prose: a rule could move from `test/spec/` into
 * `test/executer/shared/` or back without anybody updating the table, and the group of a rule would
 * again be implied by the directory a test happens to sit in. That is the failure the plan names -
 * `ChainTest.js:229` counted as executer-independent until the constructor made it otherwise, and
 * only luck made that visible.
 *
 * It cannot check the third thing, that the table matches the specification itself: the suite runs
 * in a browser and cannot read the document. A section added to SPECIFICATION.md has to be added
 * here by hand.
 */

const OPENED_BY_SHARED_SUITES = [...CHAIN_SECTIONS, ...CONTEXT_SECTIONS, ...ERROR_SECTIONS, ...EXECUTER_SECTIONS];

describe("general: the rule groups of the catalogue", () => {

	it("names every group with one of the three constants", async () => {
		const groups = Object.values(RULE_GROUPS);
		const known = groups.filter((group) => group === GENERAL || group === PER_EXECUTER || group === BOTH);
		expect(known.length).toBe(groups.length);
	});

	it("declares every section the shared suites open as per-executer or both", async () => {
		const declared = sectionsOf(PER_EXECUTER);
		const undeclared = OPENED_BY_SHARED_SUITES.filter((section) => !declared.includes(section));
		expect(undeclared.join(", ")).toBe("");
	});

	it("has a shared suite for every section it declares per-executer or both", async () => {
		const uncovered = sectionsOf(PER_EXECUTER).filter((section) => !OPENED_BY_SHARED_SUITES.includes(section));
		expect(uncovered.join(", ")).toBe("");
	});

	// Two suites opening the same section would make the count of a stage impossible to account for,
	// and it is a sign that a rule was split without anybody deciding where it belongs.
	it("opens no section in two shared suites at once", async () => {
		const seen = new Set();
		const twice = OPENED_BY_SHARED_SUITES.filter((section) => (seen.has(section) ? true : (seen.add(section), false)));
		expect(twice.join(", ")).toBe("");
	});

	// The general half is the complement, so a section that is neither is a section nobody tests.
	it("leaves no section without a group", async () => {
		const all = new Set([...sectionsOf(GENERAL), ...sectionsOf(PER_EXECUTER)]);
		expect(all.size).toBe(Object.keys(RULE_GROUPS).length);
	});
});
