import { bench, describe } from "vitest";
import { buildChain, DEPTHS } from "./ChainBuilder.js";

/**
 * Case 2 of the former PerformanceTests: the steady state. The expression is compiled once
 * and served from the CodeCache from then on, so what is measured is the walk up the chain
 * and nothing else. The original expressed this by resolving in a loop; tinybench repeats the
 * function by construction, which is the same thing.
 *
 * Read together with ColdResolve: the difference between the two is what the cache buys, and
 * it shows only at shallow depths - from a few thousand links on, the walk dominates.
 */

const CHAIN = buildChain(null);
// compile the expression once, outside every measurement
await CHAIN.get(DEPTHS[0]).resolve("${first}", "fail");

describe("warm resolve, expression served from the cache", () => {
	for (const depth of DEPTHS) {
		const resolver = CHAIN.get(depth);
		bench(`depth ${depth}`, async () => {
			await resolver.resolve("${first}", "fail");
		});
	}
});
