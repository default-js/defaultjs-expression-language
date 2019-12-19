import pack from "./src"

const global = window || global || self || this || {};
global.defaultjs = global.defaultjs || {};
global.defaultjs.el = global.defaultjs.el || {
	VERSION : "${version}",
	ExpressionResolver : pack.ExpressionResolver
};