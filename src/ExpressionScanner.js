/**
 * Finds the expressions of a text and takes a single expression apart - SPECIFICATION.md 3.1 to
 * 3.3 and 4.3. It reads where an expression begins and ends, whether it is escaped, and which scope
 * prefix it carries; evaluating a statement and addressing a scope is ExpressionResolver's.
 *
 * Internal to the package: index.js does not export it.
 */

const EXPRESSION_START = "${";
const EXPRESSION_SCOPE = /^([a-zA-Z0-9\-_\s]+)::/;

// the scanner states - everything that is not code hides the braces inside it, see
// SPECIFICATION.md 3.1
const CODE = 0;
const SINGLE_QUOTED = 1;
const DOUBLE_QUOTED = 2;
const TEMPLATE = 3;
const REGEX = 4;
const REGEX_CLASS = 5;

// a "/" continues an expression instead of opening a regular expression when it follows one of
// these - the classic division-or-regex question, decided on the last character that is not
// whitespace
const BEFORE_DIVISION = /[a-zA-Z0-9_$)\]]/;
const WHITESPACE = /\s/;

/**
 * Trims a statement, and answers null for one that is empty.
 *
 * @param {?string} value
 * @returns {?string}
 */
export const normalize = (value) => {
	if (value) {
		value = value.trim();
		return value.length == 0 ? null : value;
	}
	return null;
};

const startsRegex = (aText, aIndex) => {
	let index = aIndex - 1;
	while (index >= 0 && WHITESPACE.test(aText[index])) index--;

	return index < 0 || !BEFORE_DIVISION.test(aText[index]);
};

/**
 * Splits the text between the delimiters into the scope prefix of 3.3 and the statement. Both
 * entry points parse the prefix through this, so there is one rule for it and not two.
 */
const splitScopeAndStatement = (aContent) => {
	const scope = EXPRESSION_SCOPE.exec(aContent);
	if (!scope) return { scope: null, statement: normalize(aContent) };

	return { scope: normalize(scope[1]), statement: normalize(aContent.substring(scope[0].length)) };
};

const countBackslashes = (aText, aIndex) => {
	let count = 0;
	while (aIndex - count > 0 && aText[aIndex - count - 1] === "\\") count++;

	return count;
};

/**
 * Scans the one expression that opens with the "${" at aStart, counting braces but not the ones
 * hidden inside a literal.
 *
 * Answers a positive index directly after the matching closing brace; 0 where the text ends
 * before that brace, which per SPECIFICATION.md 3.1 means there is no expression here at all;
 * and the negated index of another "${" met outside a literal, which starts an expression of its
 * own and abandons this one.
 */
const scanExpression = (aText, aStart) => {
	const length = aText.length;
	const stack = [CODE];
	let index = aStart + 2;

	while (index < length) {
		const char = aText[index];
		switch (stack[stack.length - 1]) {
			case CODE:
				if (char === "{") stack.push(CODE);
				else if (char === "}") {
					stack.pop();
					if (stack.length === 0) return index + 1;
				} else if (char === "'") stack.push(SINGLE_QUOTED);
				else if (char === '"') stack.push(DOUBLE_QUOTED);
				else if (char === "`") stack.push(TEMPLATE);
				else if (char === "$" && aText[index + 1] === "{") return -index;
				else if (char === "/" && startsRegex(aText, index)) stack.push(REGEX);
				break;
			case SINGLE_QUOTED:
				if (char === "\\") index++;
				else if (char === "'") stack.pop();
				break;
			case DOUBLE_QUOTED:
				if (char === "\\") index++;
				else if (char === '"') stack.pop();
				break;
			case TEMPLATE:
				if (char === "\\") index++;
				else if (char === "`") stack.pop();
				else if (char === "$" && aText[index + 1] === "{") {
					stack.push(CODE);
					index++;
				}
				break;
			case REGEX:
				if (char === "\\") index++;
				else if (char === "[") stack.push(REGEX_CLASS);
				else if (char === "/") stack.pop();
				break;
			case REGEX_CLASS:
				if (char === "\\") index++;
				else if (char === "]") stack.pop();
				break;
		}
		index++;
	}

	return 0;
};

/**
 * Answers every expression of a text, in the order they stand, or null where the text carries
 * none. `start` is the index of the "$", `end` the index after the matching closing brace, so a
 * caller replaces by position and never touches an occurrence twice.
 *
 * @param {string} aText
 * @returns {?Array<{ start: number, end: number, escaped: boolean, scope: ?string, statement: ?string }>}
 */
export const scan = (aText) => {
	let occurrences = null;
	let index = aText.indexOf(EXPRESSION_START);

	while (index >= 0) {
		// 3.2: an odd run of backslashes escapes the delimiter itself. It opens nothing, so only
		// those two characters are taken out of the text and the scan carries on behind them -
		// what would have been the statement is ordinary text and may hold expressions of its own.
		if (countBackslashes(aText, index) % 2 === 1) {
			if (!occurrences) occurrences = [];
			occurrences.push({ start: index, end: index + 2, escaped: true, scope: null, statement: null });
			index = aText.indexOf(EXPRESSION_START, index + 2);
			continue;
		}

		const end = scanExpression(aText, index);
		// no matching brace: the text stands as written, and nothing behind it can be an
		// expression either - a "${" outside a literal would have restarted the scan instead
		if (end === 0) break;
		if (end < 0) {
			index = -end;
			continue;
		}

		const { scope, statement } = splitScopeAndStatement(aText.substring(index + 2, end - 1));
		if (!occurrences) occurrences = [];
		occurrences.push({ start: index, end: end, escaped: false, scope: scope, statement: statement });
		index = aText.indexOf(EXPRESSION_START, end);
	}

	return occurrences;
};

/**
 * Takes the one expression `resolve` is handed apart - SPECIFICATION.md 4.3.
 *
 * Which form is in hand is decided by the first characters of the trimmed input. The whole input
 * is one expression, so its end is the end of the input. The escaping of 3.2 does not apply here -
 * it is a rule of the text form, and there is no surrounding text, so a backslash belongs to the
 * statement.
 *
 * @param {string} aExpression
 * @returns {{ scope: ?string, statement: ?string }}
 * @throws {SyntaxError} where the input opens with "${" and does not end with "}"
 */
export const parseExpression = (aExpression) => {
	aExpression = aExpression.trim();

	if (aExpression.startsWith(EXPRESSION_START)) {
		if (!aExpression.endsWith("}")) throw new SyntaxError(`Expression does not end with "}": ${aExpression}`);

		return splitScopeAndStatement(aExpression.substring(2, aExpression.length - 1));
	}

	// anything else is a statement in full, and carries no scope prefix
	return { scope: null, statement: normalize(aExpression) };
};
