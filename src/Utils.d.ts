/**
 * The helpers more than one component uses. Internal to the package: index.js does not export
 * them.
 */
/** Whitespace in the sense of `\s`. */
export declare const WHITESPACE: RegExp;
/**
 * Whether a character may stand in a scope name: an ASCII letter, a digit,
 * "-", "_", or whitespace in the sense of `\s`, which past ASCII is left to the regular expression.
 *
 * @param {number} aCode the char code
 * @returns {boolean}
 */
export declare const isNameCharacter: (aCode: number) => boolean;
/**
 * Trims a string, and answers null for one that is empty after trimming, and for none.
 *
 * @param {?string} value
 * @returns {?string}
 */
export declare const trimToNull: (value: string | null) => string | null;
/**
 * A 32 bit hash of a string, in the manner of Java's `String.hashCode`.
 *
 * @param {string} aString
 * @returns {number}
 */
export declare const stringToHashcode: (aString: string) => number;
