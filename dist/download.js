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
    const subContentType = utils_1.castSubContentType(commander_1.default.args[0].split('/')[1]);
    const index = Number(commander_1.default.args[0].split('/')[2]);
    const client = await client_1.getClient();
    const settings = await settings_1.getSettings();
    const customize = await client.app.getAppCustomize({ app: settings.appId });
    const file = customize[device][subContentType][index];
    if (!file || file.type === 'URL') {
        utils_1.outputMessage('File does not exist');
        return;
    }
    fs_1.default.writeFileSync(file.file.name, Buffer.from(await client.file.downloadFile({ fileKey: file.file.fileKey })));
    utils_1.outputMessage(`Downloaded ${file.file.name}`);
})();
