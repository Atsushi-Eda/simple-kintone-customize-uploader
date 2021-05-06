"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = void 0;
const utils_1 = require("./utils");
const options_1 = require("./options");
const getSettings = async () => {
    const settings = {
        appId: options_1.options.appId,
        watch: Boolean(options_1.options.watch),
        desktop: Boolean(options_1.options.desktop),
        mobile: Boolean(options_1.options.mobile),
        rewrite: Boolean(options_1.options.rewrite),
    };
    settings.appId = Number(settings.appId || (await utils_1.readUserInput('Input your app id: ')));
    return settings;
};
exports.getSettings = getSettings;
