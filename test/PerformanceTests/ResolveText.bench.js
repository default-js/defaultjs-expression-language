import { bench, describe } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * What replacing expressions in a text costs. The other three benchmarks all call `resolve` with
 * a single expression, so until this file existed the whole text path was unmeasured - and it was
 * the path the expression parsing rework of 2026-08-29 replaced: two full-text `split`s per
 * distinct expression before it, one pass building the result by position since.
 *
 * Four cases, because they stress different halves of that work:
 *
 * - **distinct** - many different expressions in one text. It was the case the `split`/`join`
 *   replacement punished most, and it came out 45 % faster.
 * - **repeated** - one expression standing many times. The one case that pays for 4.3: it used to
 *   be evaluated once for all occurrences and is now evaluated per occurrence, about seven times
 *   the cost. That is the rule, not a regression - see `DECISIONS.md`.
 * - **plain** - text of the same size carrying no expression at all. The most common case in a
 *   template engine, which passes far more text than it does expressions, and the one the
 *   hand-written scanner had to defend against a native `RegExp.exec`. It came out twice as fast,
 *   because a text without a delimiter is skipped by `indexOf`.
 * - **literals** - expressions carrying string, template, object and regex literals. Not
 *   comparable against numbers taken before 2026-08-29: the regular expression could not see most
 *   of these, so it did far less work than it should. It stays as the instrument for the cost of
 *   the scanner's literal states, which is what decided the regex-literal branch.
 *
 * None of the four expressions in `literals` fails - deliberately, because a failing statement
 * writes a warning with a stack trace and that would be measured instead of the parsing.
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
