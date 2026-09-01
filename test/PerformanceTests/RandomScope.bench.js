import { bench, describe } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../ExecuterCapabilities.js";
import { bindExecuter } from "./ChainBuilder.js";

/**
 * Case 3 of the former PerformanceTests, and a different question from the other two. Every
 * link carries a context of its own, filled with a random selection out of a fixed pool of
 * names, and the expression asks for a random name as well. The match is therefore found at
 * a random depth instead of always at the bottom - which is what a real scope chain looks
 * like, and it means only a few links are walked on average however tall the chain is.
 *
 * It is also the only one of the three that puts many distinct statements through the
 * CodeCache rather than a single one, so it exercises the cache as a cache. Since 2026-08-30
 * it does that for every executer, each of which keeps a cache of its own.
 *
 * Setup lives in the module body on purpose - see ChainBuilder.js for why a bench file has
 * nowhere else to put it.
 */

const MAX_VARNAMES = 100;
const VARS_PER_CONTEXT = 20;
// two depths, because the interesting question here is whether a hit near the top costs less
// than a hit at the bottom: with ~10 of 100 names per link a random name is present within a
// handful of links, so if the walk stopped at the match these two would barely differ
const DEPTHS = [1000, 100000];

const nextInt = (max, min = 0) => min + Math.floor(Math.random() * (max - min));

const buildContext = () => {
	const context = {};
	const length = nextInt(VARS_PER_CONTEXT);
	for (let i = 0; i < length; i++) context["var" + nextInt(MAX_VARNAMES)] = true;

	return context;
};

const wanted = new Set(DEPTHS);
const entries = new Map();
let resolver = null;
for (let depth = 1; depth <= Math.max(...DEPTHS); depth++) {
	resolver = new ExpressionResolver({ context: buildContext(), name: "next" + depth, parent: resolver });
	if (wanted.has(depth)) entries.set(depth, resolver);
}

for (const { name: executer, variableName } of EXECUTERS) {
	describe(`random scope lookup [${executer}]`, () => {
		for (const depth of DEPTHS) {
			const entry = bindExecuter(entries.get(depth), executer);
			bench(`depth ${depth}`, async () => {
				await entry.resolve("${" + variableName("var" + nextInt(MAX_VARNAMES)) + "}", true);
			});
		}
	});
}
