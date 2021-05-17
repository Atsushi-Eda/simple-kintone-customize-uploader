"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_watch_1 = __importDefault(require("node-watch"));
const fs_1 = __importDefault(require("fs"));
const commander_1 = __importDefault(require("commander"));
const utils_1 = require("./utils");
const clientUtils_1 = require("./clientUtils");
const settings_1 = require("./settings");
const client_1 = require("./client");
const uploadCustomizeFiles = (client, filePaths, desktop, mobile) => Promise.all([desktop, mobile]
    .flat()
    .map((valid) => Promise.all(filePaths.map(async (filePath) => !valid || utils_1.isUrl(filePath) ? '' : (await client.file.uploadFile({ file: { path: filePath } })).fileKey))));
const generateUpdateCustomizeParameterProperty = (appCustomizeResponse, filePaths, fileKeys) => {
    const appCustomizeParameter = appCustomizeResponse;
    filePaths.forEach((filePath, index) => {
        const customizeFileType = utils_1.castCustomizeFileType(utils_1.getExtension(filePath));
        let removeIndex = -1;
        let insertIndex = appCustomizeResponse[customizeFileType].length;
        removeIndex = appCustomizeResponse[customizeFileType].findIndex((file) => (file.type === 'URL' && file.url === filePath) ||
            (file.type === 'FILE' && file.file.name === utils_1.getFileName(filePath)));
        if (removeIndex >= 0) {
            (appCustomizeParameter[customizeFileType] || []).splice(removeIndex, 1);
            insertIndex = removeIndex;
        }
        (appCustomizeParameter[customizeFileType] || []).splice(insertIndex, 0, fileKeys[index]
            ? {
                type: 'FILE',
                file: { fileKey: fileKeys[index] },
            }
            : {
                type: 'URL',
                url: filePath,
            });
    });
    return appCustomizeParameter;
};
const updateCustomize = async (client, app, filePaths, desktop, mobile) => {
    if (!filePaths.length) {
        return;
    }
    utils_1.outputMessage('Getting current customization setting on kintone app...');
    const customize = await clientUtils_1.getUpdatableCustomize(client, app);
    utils_1.outputMessage('Uploading customization files...');
    const fileKeys = await uploadCustomizeFiles(client, filePaths, desktop, mobile);
    const updateCustomizeParameter = { app };
    if (desktop) {
        updateCustomizeParameter.desktop = generateUpdateCustomizeParameterProperty(customize.desktop, filePaths, fileKeys[0]);
    }
    if (mobile) {
        updateCustomizeParameter.mobile = generateUpdateCustomizeParameterProperty(customize.mobile, filePaths, fileKeys[1]);
    }
    utils_1.outputMessage('Updating customize setting...');
    await client.app.updateAppCustomize(updateCustomizeParameter);
};
const updateViews = async (client, app, filePaths, mobile) => {
    if (!filePaths.length) {
        return;
    }
    utils_1.outputMessage('Getting current views setting on kintone app...');
    const { views } = await client.app.getViews({ app });
    const updateViewsParameter = { app, views };
    filePaths.forEach((filePath) => {
        const viewName = utils_1.getFileNameWithoutExtension(filePath);
        const html = fs_1.default.readFileSync(filePath, 'utf8');
        if (viewName in updateViewsParameter.views) {
            const view = updateViewsParameter.views[viewName];
            if (view.type === 'CUSTOM') {
                view.html = html;
            }
        }
        else {
            updateViewsParameter.views[viewName] = {
                type: 'CUSTOM',
                name: viewName,
                index: String(Object.keys(updateViewsParameter.views).length),
                html,
                device: mobile ? 'ANY' : 'DESKTOP',
            };
        }
    });
    utils_1.outputMessage('Updating views setting...');
    await client.app.updateViews(updateViewsParameter);
};
const deployApp = async (client, app) => {
    await client.app.deployApp({ apps: [{ app }] });
    utils_1.outputMessage('Wait for deploying completed...');
    await clientUtils_1.sleepUntilDeployFinish(client, app);
    utils_1.outputMessage('Setting has been deployed!\n');
};
(async () => {
    commander_1.default.parse(process.argv);
    const filePaths = commander_1.default.args[0].split(',');
    const customizeFilePaths = filePaths.filter((filePath) => !utils_1.isHtml(utils_1.getExtension(filePath)));
    const viewFilePaths = filePaths.filter((filePath) => utils_1.isHtml(utils_1.getExtension(filePath)));
    const client = await client_1.getClient();
    const settings = await settings_1.getSettings();
    await updateCustomize(client, settings.appId, customizeFilePaths, settings.desktop, settings.mobile);
    await updateViews(client, settings.appId, viewFilePaths, settings.mobile);
    await deployApp(client, settings.appId);
    if (settings.watch) {
        let processing = false;
        utils_1.outputMessage('Watching for file changes...');
        filePaths
            .filter((filePath) => !utils_1.isUrl(filePath))
            .forEach((filePath) => {
            node_watch_1.default(filePath, async () => {
                if (processing) {
                    return;
                }
                processing = true;
                await updateCustomize(client, settings.appId, customizeFilePaths, settings.desktop, settings.mobile);
                await updateViews(client, settings.appId, viewFilePaths, settings.mobile);
                await deployApp(client, settings.appId);
                processing = false;
                utils_1.outputMessage('Watching for file changes...');
            });
        });
    }
})();
//# sourceMappingURL=upload.js.map