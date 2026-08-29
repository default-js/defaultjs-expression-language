import { bench, describe } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * What replacing expressions in a text costs. The other three benchmarks all call `resolve` with
 * a single expression, so until this file existed the whole text path was unmeasured - and it is
 * the path `plans/expression-parsing.md` rewrites: today two full-text `split`s per distinct
 * expression, afterwards one pass building the result by position.
 *
 * Four cases, because they stress different halves of that work:
 *
 * - **distinct** - many different expressions in one text. Today one scan and two splits per
 *   expression, so the cost grows with the text as well as with the count.
 * - **repeated** - one expression standing many times. Today it is evaluated once and every
 *   occurrence is replaced by that one result; per 4.3 it will be evaluated once per occurrence,
 *   so this case is expected to get *slower* and is here to show by how much.
 * - **plain** - text of the same size carrying no expression at all. Today a single native
 *   `RegExp.exec` walks it; afterwards a hand-written scanner does. This is the likeliest place
 *   for a regression, and the most common case in a template engine, which passes far more text
 *   than it does expressions.
 * - **literals** - expressions carrying string, template, object and regex literals. This one is
 *   *not* comparable across the change: today the regular expression cannot see most of these,
 *   so it does far less work than it should. It exists as the instrument for the question stage 2
 *   has to answer with numbers - whether detecting regex literals is worth its cost.
 *
 * None of the four expressions in `literals` produces an execution error under the current
 * implementation - deliberately, because a swallowed error writes a warning with a stack trace
 * and that would be measured instead of the parsing.
 *
 * Setup lives in the module body on purpose - see ChainBuilder.js for why a bench file has
 * nowhere else to put it.
 */

const COUNT = 20;
const FILLER = "some text between the expressions, long enough to be walked ";

const CONTEXT = { word: "value", count: 3, prefix: "p" };

const buildText = (expression) => {
	let text = "";
	for (let i = 0; i < COUNT; i++) text += FILLER + expression(i) + " ";

	return text;
};

const TEXT_DISTINCT = buildText((i) => "${ count + " + i + " }");
const TEXT_REPEATED = buildText(() => "${ word }");
const TEXT_PLAIN = buildText((i) => "no expression " + i);
const TEXT_LITERALS = buildText((i) => {
	switch (i % 5) {
		case 0:
			return "${ {a: 1}.a }";
		case 1:
			return "${ (() => { return count; })() }";
		case 2:
			return "${ `x${word}y` }";
		case 3:
			return "${ /ab/.test(word) }";
		default:
			return '${ "a::b".length }';
	}
});

const RESOLVER = new ExpressionResolver({ context: CONTEXT, name: "root" });

// one call per text before the measurement, so the code cache is warm and what is measured is
// the text handling rather than the first compilation of every statement in it
await RESOLVER.resolveText(TEXT_DISTINCT);
await RESOLVER.resolveText(TEXT_REPEATED);
await RESOLVER.resolveText(TEXT_PLAIN);
await RESOLVER.resolveText(TEXT_LITERALS);

describe("resolveText over a text", () => {
	bench(`${COUNT} distinct expressions`, async () => {
		await RESOLVER.resolveText(TEXT_DISTINCT);
	});

	bench(`one expression ${COUNT} times`, async () => {
		await RESOLVER.resolveText(TEXT_REPEATED);
	});

	bench("no expression at all", async () => {
		await RESOLVER.resolveText(TEXT_PLAIN);
	});

	bench("expressions carrying literals", async () => {
		await RESOLVER.resolveText(TEXT_LITERALS);
	});
});
