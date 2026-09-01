import { bench, describe } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../ExecuterCapabilities.js";

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
 * writes a warning with a stack trace and that would be measured instead of the parsing. Since the
 * case runs under every executer it also has to hold for the strictest of them, which is what took
 * the context read out of the arrow function on 2026-08-30; the `literals` numbers from before that
 * day are therefore not comparable either.
 *
 * Since 2026-08-30 all four cases run under every executer. The text handling itself is the
 * resolver's and does not change with the executer, so what the comparison shows is what each
 * executer costs per expression - `plain` is the control, it carries none.
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

/**
 * The four texts, spelled for one executer - `ContextObjectExecuter` addresses a context value as
 * `ctx.value` where the other three take `value` (SPECIFICATION.md 8.3).
 */
const buildTexts = (variableName) => {
	const word = variableName("word");
	const count = variableName("count");

	return {
		distinct: buildText((i) => "${ " + count + " + " + i + " }"),
		repeated: buildText(() => "${ " + word + " }"),
		plain: buildText((i) => "no expression " + i),
		literals: buildText((i) => {
			switch (i % 5) {
				case 0:
					return "${ {a: 1}.a }";
				case 1:
					// the braces of a function body, not a context read: EsprimaExecuter cannot reach a
					// context value from inside a nested function (BACKLOG.md), and a statement that
					// fails would measure the warning it writes instead of the parsing
					return "${ (() => { return 1; })() }";
				case 2:
					return "${ `x${" + word + "}y` }";
				case 3:
					return "${ /ab/.test(" + word + ") }";
				default:
					return '${ "a::b".length }';
			}
		})
	};
};

const ENTRIES = EXECUTERS.map(({ name: executer, variableName }) => ({
	executer,
	texts: buildTexts(variableName),
	resolver: new ExpressionResolver({ context: CONTEXT, name: "root", executer })
}));

// one call per text before the measurement, so the code cache is warm and what is measured is
// the text handling rather than the first compilation of every statement in it
for (const { texts, resolver } of ENTRIES) {
	for (const text of Object.values(texts)) await resolver.resolveText(text);
}

for (const { executer, texts, resolver } of ENTRIES) {
	describe(`resolveText over a text [${executer}]`, () => {
		bench(`${COUNT} distinct expressions`, async () => {
			await resolver.resolveText(texts.distinct);
		});

		bench(`one expression ${COUNT} times`, async () => {
			await resolver.resolveText(texts.repeated);
		});

		bench("no expression at all", async () => {
			await resolver.resolveText(texts.plain);
		});

		bench("expressions carrying literals", async () => {
			await resolver.resolveText(texts.literals);
		});
	});
}
