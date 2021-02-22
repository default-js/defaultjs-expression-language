import pack from "./src"
import GLOBAL from "@modules/@default-js/defaultjs-common-utils/src/Global";


GLOBAL.defaultjs = GLOBAL.defaultjs || {};
GLOBAL.defaultjs.el = GLOBAL.defaultjs.el || (() => {
	pack.VERSION = "${version}";
	return pack;
})();