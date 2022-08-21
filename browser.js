import { ExpressionResolver, Context } from "./src";
import GLOBAL from "@default-js/defaultjs-common-utils/src/Global";

GLOBAL.defaultjs = GLOBAL.defaultjs || {};
GLOBAL.defaultjs.el = GLOBAL.defaultjs.el || {
	VERSION: "${version}",
	ExpressionResolver,
};

export { ExpressionResolver, Context };
