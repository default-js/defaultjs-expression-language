import { bench, describe } from "vitest";
import { EXECUTERS } from "../ExecuterCapabilities.js";
import { buildChain, bindExecuter, DEPTHS } from "./ChainBuilder.js";

/**
 * Case 2 of the former PerformanceTests: the steady state. The expression is compiled once
 * and served from the CodeCache from then on, so what is measured is the walk up the chain
 * and nothing else. The original expressed this by resolving in a loop; tinybench repeats the
 * function by construction, which is the same thing.
 *
 * Read together with ColdResolve: the difference between the two is what the cache buys, and
 * it shows only at shallow depths - from a few thousand links on, the walk dominates.
 *
 * Every executer runs the same chain since 2026-08-30. What the walk costs is the resolver's,
 * but how often it is walked is the executer's: one of the four reads the names of the context
 * before every execution, which walks the chain a second time.
 */

const CHAIN = buildChain(null);

const ENTRIES = EXECUTERS.map(({ name: executer, variableName }) => ({
	executer,
	expression: `\${${variableName("first")}}`,
	resolvers: new Map(DEPTHS.map((depth) => [depth, bindExecuter(CHAIN.get(depth), executer)]))
}));

// compile the expression of each executer once, outside every measurement - the code caches are
// separate, so a warm cache for one of them says nothing about the next
for (const { expression, resolvers } of ENTRIES) await resolvers.get(DEPTHS[0]).resolve(expression, "fail");

for (const { executer, expression, resolvers } of ENTRIES) {
	describe(`warm resolve, expression served from the cache [${executer}]`, () => {
		for (const depth of DEPTHS) {
			const resolver = resolvers.get(depth);
			bench(`depth ${depth}`, async () => {
				await resolver.resolve(expression, "fail");
			});
		}
	});
}
