import { ExpressionResolver, Context, ExecuterRegistry } from "./index.js";
import "./src/executer/EsprimaExecuter.js";
import GLOBAL from "@default-js/defaultjs-common-utils/src/Global";
import { VERSION } from "./src/version.js";

GLOBAL.defaultjs = GLOBAL.defaultjs || {};
GLOBAL.defaultjs.el = GLOBAL.defaultjs.el || {
	VERSION,
	ExpressionResolver,
	ExecuterRegistry
};

export { ExpressionResolver, ExecuterRegistry };
