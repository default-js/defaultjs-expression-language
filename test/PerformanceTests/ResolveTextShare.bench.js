import { bench, describe } from "vitest";
import { ExpressionResolver } from "../../index.js";
import TestExecuter from "../TestExecuter.js";

/**
 * What `resolveText` costs of its own: the scan, the replacement, the call of each statement and
 * the building of the text - with `TestExecuter`, which evaluates nothing and answers the statement,
 * so no executer's cost hides the resolver's share. `ResolveText.bench.js` measures the same path
 * under the real executers, where the executer is most of the time and a change to the resolver
 * drowns in the spread between runs; this file is the instrument for such a change.
 *
 * Cases at 20 expressions, as in `ResolveText.bench.js`, plus one with comments, whose ranges the
 * scanner records, and one with escaped expressions, which the scanner handles without handing them
 * on. `distinct` again at 200 and 2,000 expressions,
 * because a difference per occurrence shows only once there are enough of them - the sizes of the
 * probe in `DECISIONS.md` (2026-09-27), about 1.5 KB, 15 KB and 155 KB of text.
 *
 * No case fails: a failing statement writes a warning with a stack trace, and that would be
 * measured instead of the resolver.
 *
 * Setup lives in the module body on purpose - see ChainBuilder.js for why a bench file has
 * nowhere else to put it.
 */

const FILLER = "some text between the expressions, long enough to be walked ";

const buildText = (aCount, anExpression) => {
	let text = "";
	for (let i = 0; i < aCount; i++) text += FILLER + anExpression(i) + " ";

	return text;
};

const LITERALS = ["${ {a: 1}.a }", "${ (() => { return 1; })() }", "${ `x${word}y` }", "${ /ab/.test(word) }", '${ "a::b".length }'];

// both kinds of comment, a brace hidden in one, and a slash the division-or-regex rule decides past one
const COMMENTS = ["${ count /* note */ + 1 }", "${ count // note\n }", "${ /* } */ count }", "${ count /* c */ / 2 }", "${ word /* a */ /* b */ }"];

const TEXTS = {
	distinct: buildText(20, (i) => "${ count + " + i + " }"),
	repeated: buildText(20, () => "${ word }"),
	plain: buildText(20, (i) => "no expression " + i),
	literals: buildText(20, (i) => LITERALS[i % LITERALS.length]),
	comments: buildText(20, (i) => COMMENTS[i % COMMENTS.length]),
	escaped: buildText(20, (i) => "\\${ count + " + i + " }"),
	distinct200: buildText(200, (i) => "${ count + " + i + " }"),
	distinct2000: buildText(2000, (i) => "${ count + " + i + " }")
};

const resolver = new ExpressionResolver({ context: { word: "value", count: 3 }, name: "root", executer: new TestExecuter() });

describe("resolveText, the resolver's own share [TestExecuter]", () => {
	bench("20 distinct expressions", async () => {
		await resolver.resolveText(TEXTS.distinct);
	});

	bench("one expression 20 times", async () => {
		await resolver.resolveText(TEXTS.repeated);
	});

	bench("no expression at all", async () => {
		await resolver.resolveText(TEXTS.plain);
	});

	bench("expressions carrying literals", async () => {
		await resolver.resolveText(TEXTS.literals);
	});

	bench("expressions carrying comments", async () => {
		await resolver.resolveText(TEXTS.comments);
	});

	bench("20 escaped expressions", async () => {
		await resolver.resolveText(TEXTS.escaped);
	});

	bench("200 distinct expressions", async () => {
		await resolver.resolveText(TEXTS.distinct200);
	});

	bench("2,000 distinct expressions", async () => {
		await resolver.resolveText(TEXTS.distinct2000);
	});
});
