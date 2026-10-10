/**
 * A default value as the resolver carries it, which tells "no default passed" apart from "the
 * default is undefined".
 *
 * @export
 * @class DefaultValue
 */
export default class DefaultValue {
    /** @type {boolean} whether a default was passed */
    hasValue: boolean;
    /** @type {*} the default, meaningful only where hasValue is true */
    value: any;
    /**
     * Created without an argument, it carries no default; created with one, it carries that
     * argument, undefined included.
     *
     * @constructor
     * @param {*} [value]
     */
    constructor(value?: any);
}
