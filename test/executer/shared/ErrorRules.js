import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { catchError } from "../../TestUtils.js";

/**
 * The sections of SPECIFICATION.md this suite opens. Held against the catalogue by
 * test/general/RuleGroupTest.js: 7 is declared `both` - the warnings are the general half.
 */
export const SECTIONS = ["7"];

/**
 * SPECIFICATION.md 7 - what the two entry points do with an error, for one executer.
 *
 * A text keeps rendering and leaves the expression that failed standing as written, while `resolve`
 * logs the error and lets it through. Neither answers the default value for an error - a default
 * covers a missing result, never a failing statement. The error arrives from the executer, so both
 * halves are asked of every one of them; none of this is a capability, the rule holds throughout.
 *
 * What the warnings say happens above the executer and is checked once, in the general suite.
 *
 * @param {{name: string, variableName: Function}} anExecuterEntry an entry of EXECUTERS
 */
export const errorRules = ({ name: executer, variableName }) => {

	describe(`Specification 7 - a failing statement is caught in a text [${executer}]`, () => {

		it("leaves the expression standing as written", async () => {
			const variableNameMissing = variableName("missing");
			const failing = `\${${variableNameMissing}.deep}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const result = await resolver.resolveText(failing);
			expect(result).toBe(failing);
		});

		it("leaves it standing even where a default value was passed", async () => {
			const variableNameMissing = variableName("missing");
			const failing = `\${${variableNameMissing}.deep}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const result = await resolver.resolveText(failing, "fallback");
			expect(result).toBe(failing);
		});

		it("never stops the rest of a text from rendering", async () => {
			const variableNameKnown = variableName("known");
			const variableNameMissing = variableName("missing");
			const failing = `\${${variableNameMissing}.deep}`;
			const resolver = new ExpressionResolver({ context: { known: "ok" }, name: "root", executer });
			const result = await resolver.resolveText(`\${${variableNameKnown}} ${failing} \${${variableNameKnown}}`);
			expect(result).toBe(`ok ${failing} ok`);
		});
	});

	describe(`Specification 7 - resolve lets the error through [${executer}]`, () => {

		it("raises the error the statement raised", async () => {
			const variableNameMissing = variableName("missing");
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const error = await catchError(() => resolver.resolve(`\${${variableNameMissing}.deep}`));
			expect(error instanceof Error).toBe(true);
		});

		it("raises it even where a default value was passed", async () => {
			const variableNameMissing = variableName("missing");
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			const error = await catchError(() => resolver.resolve(`\${${variableNameMissing}.deep}`, "fallback"));
			expect(error instanceof Error).toBe(true);
		});
	});
};
