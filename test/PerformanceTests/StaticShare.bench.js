import { bench, describe } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * What a static entry point costs beyond the executer. `ExpressionResolver.resolve` and
 * `resolveText` build a resolver of their own on every call - a generated name, a
 * `ResolverContextHandle` with its name snapshot over the context and its prototype chain, and the
 * proxy - and then delegate to the instance method. Every other bench file calls instance methods
 * only.
 *
 * Under `TestExecuter`, which evaluates nothing, so no executer's cost hides that share, as in
 * `ResolveTextShare.bench.js`. Each entry point runs three ways: the instance method on a resolver
 * built once, as the reference, and the static one over a small and over a larger context, because
 * the name snapshot grows with the keys of the context. The difference to the reference is what
 * building the resolver costs.
 *
 * One expression per call and a short text around it, so the per-call cost is not diluted by the
 * work per expression.
 *
 * The static entry points take no executer, so the module body sets
 * `ExpressionResolver.defaultExecuter` and never puts it back: there is no hook to do it in (see
 * ChainBuilder.js), and it does not need to be - vitest runs every file in an iframe of its own in
 * the browser, so no other bench file sees the change.
 */

const EXPRESSION = "${ word }";
const TEXT = "some text before ${ word } and some after";

const SMALL = { word: "value", count: 3 };
const LARGE = { word: "value" };
for (let i = 0; i < 1000; i++) LARGE["key" + i] = i;

ExpressionResolver.defaultExecuter = new TestExecuter();

const resolver = new ExpressionResolver({ context: SMALL, name: "root" });

describe("resolve, the static entry point's own share [TestExecuter]", () => {
	bench("instance, as the reference", async () => {
		await resolver.resolve(EXPRESSION);
	});

	bench("static, 2 keys", async () => {
		await ExpressionResolver.resolve(EXPRESSION, SMALL);
	});

	bench("static, 1,000 keys", async () => {
		await ExpressionResolver.resolve(EXPRESSION, LARGE);
	});
});

describe("resolveText, the static entry point's own share [TestExecuter]", () => {
	bench("instance, as the reference", async () => {
		await resolver.resolveText(TEXT);
	});

	bench("static, 2 keys", async () => {
		await ExpressionResolver.resolveText(TEXT, SMALL);
	});

	bench("static, 1,000 keys", async () => {
		await ExpressionResolver.resolveText(TEXT, LARGE);
	});
});
