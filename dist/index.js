#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
commander_1.default
    .command('upload <filePaths>', 'Upload customize files', {
    isDefault: true,
    executableFile: 'upload',
})
    .command('download <device/subContentType/index>', 'Download customize file', {
    executableFile: 'download',
})
    .command('remove <device/subContentType/index>', 'Remove customize file', {
    executableFile: 'remove',
})
    .command('list', 'Show customize files list', {
    executableFile: 'list',
})
    .parse(process.argv);
