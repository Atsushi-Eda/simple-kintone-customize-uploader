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
    const [, contentType] = commander_1.default.args[0].split('/');
    const index = Number(commander_1.default.args[0].split('/')[2]);
    const client = await client_1.getClient();
    const settings = await settings_1.getSettings();
    if (!utils_1.isHtml(contentType)) {
        const customizeFileType = utils_1.castCustomizeFileType(contentType);
        utils_1.outputMessage('Getting current customization setting on kintone app...');
        const customize = await clientUtils_1.getUpdatableCustomize(client, settings.appId);
        const [removedFile] = customize[device][customizeFileType].splice(index, 1);
        if (!removedFile ||
            (await utils_1.readUserInput(`Do you remove ${removedFile.type === 'URL' ? removedFile.url : removedFile.file.name} in ${device}-${customizeFileType}?(Y/n): `)) === 'n') {
            utils_1.outputMessage('Did not remove.');
            return;
        }
        utils_1.outputMessage('Updating customize setting...');
        await client.app.updateAppCustomize({
            app: settings.appId,
            [device]: {
                [customizeFileType]: customize[device][customizeFileType],
            },
        });
    }
    else {
        utils_1.outputMessage('Getting current views setting on kintone app...');
        const { views } = await client.app.getViews({ app: settings.appId });
        const removedView = Object.values(views).find((view) => Number(view.index) === index);
        if (!removedView || (await utils_1.readUserInput(`Do you remove ${removedView.name} in views?(Y/n): `)) === 'n') {
            utils_1.outputMessage('Did not remove.');
            return;
        }
        delete views[removedView.name];
        utils_1.outputMessage('Updating views setting...');
        await client.app.updateViews({
            app: settings.appId,
            views,
        });
    }
    await client.app.deployApp({ apps: [{ app: settings.appId }] });
    utils_1.outputMessage('Wait for deploying completed...');
    await clientUtils_1.sleepUntilDeployFinish(client, settings.appId);
    utils_1.outputMessage('Setting has been deployed!');
})();
//# sourceMappingURL=remove.js.map