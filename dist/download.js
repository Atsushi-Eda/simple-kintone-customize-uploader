"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const settings_1 = require("./settings");
const client_1 = require("./client");
(async () => {
    commander_1.default.parse(process.argv);
    const device = utils_1.castDevice(commander_1.default.args[0].split('/')[0]);
    const [, contentType] = commander_1.default.args[0].split('/');
    const index = Number(commander_1.default.args[0].split('/')[2]);
    const client = await client_1.getClient();
    const settings = await settings_1.getSettings();
    if (!utils_1.isHtml(contentType)) {
        const customizeFileType = utils_1.castCustomizeFileType(contentType);
        const customize = await client.app.getAppCustomize({ app: settings.appId });
        const file = customize[device][customizeFileType][index];
        if (!file || file.type === 'URL') {
            utils_1.outputMessage('File does not exist.');
            return;
        }
        fs_1.default.writeFileSync(file.file.name, Buffer.from(await client.file.downloadFile({ fileKey: file.file.fileKey })));
        utils_1.outputMessage(`Downloaded ${file.file.name}`);
    }
    else {
        const { views } = await client.app.getViews({ app: settings.appId });
        const targetView = Object.values(views).find((view) => Number(view.index) === index);
        if (!targetView || targetView.type !== 'CUSTOM') {
            utils_1.outputMessage('Not customized view.');
            return;
        }
        fs_1.default.writeFileSync(`${targetView.name}.html`, targetView.html);
        utils_1.outputMessage(`Downloaded ${targetView.name}.html`);
    }
})();
//# sourceMappingURL=download.js.map