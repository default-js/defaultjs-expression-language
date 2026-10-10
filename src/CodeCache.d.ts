/**
 * @typedef {Object} CacheEntry
 * @property {number} lastHit - Monotonic marker of the last read or write, the eviction order.
 * @property {string} key
 * @property {Function} value
 */
export type CacheEntry = {
    /**
     * - Monotonic marker of the last read or write, the eviction order.
     */
    lastHit: number;
    key: string;
    value: Function;
};
export type CodeCacheOptions = {
    /**
     * - Maximum number of entries in the cache, a fraction rounded down. If set
     * to 0 or less, caching is disabled. Left out, the size stays as it is.
     */
    size?: number;
};
/**
 * CodeCache class to manage caching of generated code snippets.
 *
 * Entries are evicted least recently used first: every hit refreshes the entry, so an
 * expression that keeps being resolved outlives one that was compiled once and dropped.
 * The marker is a counter rather than a timestamp — a burst of first-time compilations
 * falls into a single millisecond, which would leave the eviction order to chance.
 */
export default class CodeCache {
    #private;
    /**
     * Starts with a size of 5000, then applies the options.
     *
     * @param {CodeCacheOptions} options
     */
    constructor(options?: CodeCacheOptions);
    /**
     * Applies what the options carry and leaves everything else as it is. A size of 0 or less
     * disables the cache and releases its entries, a later positive size enables it again and starts
     * empty.
     *
     * @param {CodeCacheOptions} options
     * @throws {TypeError} where the size is not a finite number
     */
    setup({ size }?: CodeCacheOptions): void;
    /**
     * Whether an entry is held under the key. A disabled cache holds none. Asking does not count as a
     * hit, so it leaves the eviction order alone.
     *
     * @param {string} key
     * @returns {boolean}
     */
    has(key: string): boolean;
    /**
     * The code held under the key, or null where none is held or the cache is disabled. A hit
     * refreshes the entry, so it is evicted last.
     *
     * @param {string} key
     * @returns {?Function}
     */
    get(key: string): Function | null;
    /**
     * Holds the code under the key, replacing what was held there, and refreshes the entry. Once the
     * cache reaches a tenth past its size, the least recently used entries are evicted down to the
     * size.
     * A disabled cache keeps nothing.
     *
     * @param {string} key
     * @param {Function} code
     */
    set(key: string, code: Function): void;
    /**
     * Drops every entry. The size stays as it is.
     */
    clear(): void;
}
