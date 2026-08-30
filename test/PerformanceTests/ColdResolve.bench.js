import { bench, describe } from "vitest";
import { EXECUTERS } from "../TestUtils.js";
import { buildChain, bindExecuter, DEPTHS } from "./ChainBuilder.js";

/**
 * Case 1 of the former PerformanceTests: what a resolve over a deep chain costs when nothing
 * is cached - a cache miss plus code generation plus the walk up the chain.
 *
 * tinybench calls the function over and over, so a plain resolve would compile once and be
 * served from the cache from the second iteration on, which is WarmResolve. The cache is
 * therefore switched off for this file: at size 0 the CodeCache answers every lookup with a
 * miss and the executer generates again. Compared to a genuine first call this leaves out the
 * insertion into the cache, which a disabled cache skips.
 *
 * Two chain shapes, as in the original: links carrying a context that does not match, and
 * links carrying no context at all. Since 2026-08-30 every shape runs under every executer,
 * because generating code is exactly what the four of them do differently.
 */

// every executer keeps a code cache of its own, so a cold measurement has to switch off all four
for (const { setupExecuter } of EXECUTERS) setupExecuter({ size: 0 });

const SHAPES = [
	["links carry a non-matching context", buildChain({ test: "test" })],
	["links carry no context", buildChain(null)]
];

for (const [shape, chain] of SHAPES) {
	for (const { name: executer, variableName } of EXECUTERS) {
		describe(`cold resolve, ${shape} [${executer}]`, () => {
			const expression = `\${${variableName("first")}}`;
			for (const depth of DEPTHS) {
				const resolver = bindExecuter(chain.get(depth), executer);
				bench(`depth ${depth}`, async () => {
					await resolver.resolve(expression, "fail");
				});
			}
		});
	}
}
