import GLOBAL from "@default-js/defaultjs-common-utils/src/Global.js";

/**
 * The helpers more than one component uses. Internal to the package: index.js does not export
 * them.
 */

/** Whitespace in the sense of `\s`. */
export const WHITESPACE = /\s/;

/**
 * Whether a character may stand in a scope name: an ASCII letter, a digit,
 * "-", "_", or whitespace in the sense of `\s`, which past ASCII is left to the regular expression.
 *
 * @param {number} aCode the char code
 * @returns {boolean}
 */
export const isNameCharacter = (aCode) => {
	if (aCode < 0x80)
		return (
			(aCode >= 0x61 && aCode <= 0x7a) ||
			(aCode >= 0x41 && aCode <= 0x5a) ||
			(aCode >= 0x30 && aCode <= 0x39) ||
			aCode === 0x2d ||
			aCode === 0x5f ||
			aCode === 0x20 ||
			(aCode >= 0x09 && aCode <= 0x0d)
		);

	return WHITESPACE.test(String.fromCharCode(aCode));
};

/**
 * Trims a string, and answers null for one that is empty after trimming, and for none.
 *
 * @param {?string} value
 * @returns {?string}
 */
export const trimToNull = (value) => {
	if (value) {
		value = value.trim();
		return value.length == 0 ? null : value;
	}
	return null;
};

/**
 * A 32 bit hash of a string, in the manner of Java's `String.hashCode`.
 *
 * @param {string} aString
 * @returns {number}
 */
export const stringToHashcode = (aString) => {
	let hash = 0;
	if (aString.length == 0) return hash;
	const length = aString.length;
	for (let i = 0; i < length; i++) {
		const char = aString.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

const ID_CHARACTER = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * A string of random ASCII letters.
 *
 * @param {number} aLength how many letters
 * @returns {string}
 */
const generateId = (aLength) => {
	let id = "";
	for (let i = 0; i < aLength; i++)
		id += ID_CHARACTER.charAt(Math.floor(Math.random() * ID_CHARACTER.length));
	return id;
};

/**
 * A variable name the global object does not carry as an own property at the time of the call:
 * random ASCII letters between a prefix and a suffix. Where every attempt at one length hits a
 * global, it goes on with four letters more.
 *
 * @param {object} [options]
 * @param {string} [options.prefix] put before the letters, nothing where left out
 * @param {string} [options.suffix] put after the letters, nothing where left out
 * @param {number} [options.minLength=10] how many letters the first attempts carry
 * @returns {string}
 */
export const undeclaredVarname = ({ prefix, suffix, minLength = 10 } = {}) => {
	let count = minLength;
	do {
		for (let i = 0; i < ID_CHARACTER.length * count; i++) {
			const name = `${prefix || ""}${generateId(count)}${suffix || ""}`;
			if (!GLOBAL.hasOwnProperty(name)) return name;
		}
		count += 4;
	} while (true);
};
