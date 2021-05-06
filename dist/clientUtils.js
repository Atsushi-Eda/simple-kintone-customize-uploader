"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleepUntilDeployFinish = exports.getUpdatableCustomize = void 0;
const utils_1 = require("./utils");
async function copyFile(client, file) {
    return (await client.file.uploadFile({
        file: {
            name: file.name,
            data: await client.file.downloadFile({ fileKey: file.fileKey }),
        },
    })).fileKey;
}
async function getUpdatableCustomize(client, app) {
    const customize = await client.app.getAppCustomize({ app });
    const customizeChunks = await Promise.all(['desktop', 'mobile'].map((device) => Promise.all(['js', 'css'].map((subContentType) => Promise.all(customize[device][subContentType].map(async (file) => file.type !== 'FILE'
        ? file
        : {
            type: 'FILE',
            file: {
                ...file.file,
                fileKey: await copyFile(client, file.file),
            },
        }))))));
    [[customize.desktop.js, customize.desktop.css], [customize.mobile.js, customize.mobile.css]] = customizeChunks;
    return customize;
}
exports.getUpdatableCustomize = getUpdatableCustomize;
async function sleepUntilDeployFinish(client, appId) {
    utils_1.sleepBy(async () => {
        const status = await client.app.getDeployStatus({ apps: [appId] }).then((response) => response.apps[0].status);
        return status !== 'PROCESSING';
    }, 1000);
}
exports.sleepUntilDeployFinish = sleepUntilDeployFinish;
