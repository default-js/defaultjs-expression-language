import { ExpressionResolver } from "../../index.js";

/**
 * Shared chain construction for the benchmarks.
 *
 * Construction must never be part of a measurement, and in a bench file there is nowhere to
 * put it but the module body: verified 2026-08-21 against vitest 4.1.11 that neither vitest's
 * own beforeAll nor tinybench's beforeAll option runs for a bench - the hook is silently
 * skipped, and a bench that then fails is reported as nothing at all.
 *
 * One chain therefore serves every depth. A chain of depth 1000000 already contains the
 * chains of depth 10, 1000 and 100000 as its own tail, so the links at those depths are kept
 * as entry points instead of building four separate chains. Resolving from the depth 10 entry
 * walks ten links down to the only match, exactly as a chain built to depth 10 would.
 */

/** the depths every chain benchmark is run at, ascending */
export const DEPTHS = [10, 1000, 100000, 1000000];

/**
 * Builds one chain up to the deepest entry of DEPTHS and returns the link found at each depth.
 * The bottom link is the only one carrying "first"; every link above it has to be walked.
 *
 * @param {?object} aContext context handed to every link above the bottom one
 * @returns {Map<number, ExpressionResolver>} depth to the resolver sitting at that depth
 */
export const buildChain = (aContext = null) => {
	const wanted = new Set(DEPTHS);
	const entries = new Map();

	let resolver = new ExpressionResolver({ context: { first: "first" }, name: "first" });
	const max = Math.max(...DEPTHS);
	for (let depth = 1; depth <= max; depth++) {
		resolver = new ExpressionResolver({ context: aContext, name: "next" + depth, parent: resolver });
		if (wanted.has(depth)) entries.set(depth, resolver);
	}

	return entries;
};
