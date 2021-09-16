const path = require("path");

const entries = {};
entries["defaultjs-expression-language"] = "./browser.js";

module.exports = {
	entry: entries,
	target: "web",
};