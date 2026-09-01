import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERNAME } from "../../../src/executer/ContextDeconstructorExecuter.js";

/**
 * What `context-deconstruction-executer` answers where the catalogue marks a capability
 * unsupported.
 *
 * One case, and it is the one every consumer of the package meets since this executer became the
 * default (`DECISIONS.md`, 2026-09-01): a write from inside an expression executes and answers, but
 * it lands on a destructured local binding and nothing carries it back to the context. 6.5 promises
 * nothing about a written value being readable afterwards, so this is conformant rather than
 * broken - and it is silent, which is why it is pinned rather than left to the marker in the shared
 * suite. `BACKLOG.md` carries the write-back that would close it.
 */
describe(`Specification 6.5 - what context-deconstruction-executer answers instead [${EXECUTERNAME}]`, () => {

	it("answers the written value while the context keeps the old one", async () => {
		const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer: EXECUTERNAME });
		const result = await resolver.resolveText('${ known = "after" }');
		expect(result).toBe("after");
		expect(resolver.getData("known")).toBe("before");
	});

	// The same seen through a text rather than through getData: two occurrences of a counting write
	// both answer 0, where an executer that keeps the write answers 0 and 1. This is the case the
	// migration note of CHANGELOG.md names.
	it("does not count across two occurrences of a counting write", async () => {
		const resolver = new ExpressionResolver({ context: { counter: 0 }, name: "root", executer: EXECUTERNAME });
		const result = await resolver.resolveText("${ counter++ } ${ counter++ }");
		expect(result).toBe("0 0");
	});
});
