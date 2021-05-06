"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const utils_1 = require("./utils");
const clientUtils_1 = require("./clientUtils");
const settings_1 = require("./settings");
const client_1 = require("./client");
(async () => {
    commander_1.default.parse(process.argv);
    const device = utils_1.castDevice(commander_1.default.args[0].split('/')[0]);
    const subContentType = utils_1.castSubContentType(commander_1.default.args[0].split('/')[1]);
    const index = Number(commander_1.default.args[0].split('/')[2]);
    const client = await client_1.getClient();
    const settings = await settings_1.getSettings();
    utils_1.outputMessage('Getting current customization setting on kintone app...');
    const customize = await clientUtils_1.getUpdatableCustomize(client, settings.appId);
    const [removedFile] = customize[device][subContentType].splice(index, 1);
    utils_1.outputMessage('Updating customize setting...');
    await client.app.updateAppCustomize({
        app: settings.appId,
        [device]: {
            [subContentType]: customize[device][subContentType],
        },
    });
    await client.app.deployApp({ apps: [{ app: settings.appId }] });
    utils_1.outputMessage('Wait for deploying completed...');
    await clientUtils_1.sleepUntilDeployFinish(client, settings.appId);
    utils_1.outputMessage('Setting has been deployed!');
    utils_1.outputMessage(`Removed ${removedFile.type === 'URL' ? removedFile.url : removedFile.file.name}`);
})();
