"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputMessage = exports.isUrl = exports.isHtml = exports.castCustomizeFileType = exports.castDevice = exports.getFileNameWithoutExtension = exports.getExtension = exports.getFileName = exports.sleepBy = exports.readUserInput = void 0;
const readline_1 = __importDefault(require("readline"));
function readUserInput(question) {
    const readlineInterface = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        readlineInterface.question(question, (answer) => {
            resolve(answer);
            readlineInterface.close();
        });
    });
}
exports.readUserInput = readUserInput;
function sleepBy(callback, milisec) {
    return new Promise((resolve) => {
        const timer = setInterval(async () => {
            if (await callback()) {
                clearInterval(timer);
                resolve();
            }
        }, milisec);
    });
}
exports.sleepBy = sleepBy;
function getFileName(filePath) {
    return filePath.split('/').pop() || '';
}
exports.getFileName = getFileName;
function getExtension(filePath) {
    return (filePath.split('.').pop() || '').toLowerCase();
}
exports.getExtension = getExtension;
function getFileNameWithoutExtension(filePath) {
    return getFileName(filePath).replace('.', '').replace(getExtension(filePath), '');
}
exports.getFileNameWithoutExtension = getFileNameWithoutExtension;
function castDevice(str) {
    switch (str) {
        case 'mobile':
            return 'mobile';
        default:
            return 'desktop';
    }
}
exports.castDevice = castDevice;
function castCustomizeFileType(str) {
    switch (str) {
        case 'css':
            return 'css';
        default:
            return 'js';
    }
}
exports.castCustomizeFileType = castCustomizeFileType;
function isHtml(str) {
    return str === 'html';
}
exports.isHtml = isHtml;
function isUrl(str) {
    return /^https?:\/\/.*/i.test(str);
}
exports.isUrl = isUrl;
function outputMessage(str) {
    // eslint-disable-next-line no-console
    console.log(str);
}
exports.outputMessage = outputMessage;
//# sourceMappingURL=utils.js.map