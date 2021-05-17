"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const utils_1 = require("./utils");
const settings_1 = require("./settings");
const client_1 = require("./client");
(async () => {
    commander_1.default.parse(process.argv);
    const client = await client_1.getClient();
    const settings = await settings_1.getSettings();
    const customize = await client.app.getAppCustomize({ app: settings.appId });
    ['desktop', 'mobile'].forEach((device) => {
        ['js', 'css'].forEach((customizeFileType) => {
            utils_1.outputMessage(`${device}-${customizeFileType}`);
            customize[device][customizeFileType].forEach((file) => {
                utils_1.outputMessage(`|-${file.type === 'URL' ? file.url : file.file.name}`);
            });
            utils_1.outputMessage('');
        });
    });
    const { views } = await client.app.getViews({ app: settings.appId });
    utils_1.outputMessage('view');
    Object.values(views)
        .sort((a, b) => Number(a.index) - Number(b.index))
        .forEach((view) => {
        utils_1.outputMessage(`|-${view.name} (${view.type})`);
    });
    utils_1.outputMessage('');
})();
//# sourceMappingURL=list.js.map