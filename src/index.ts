#!/usr/bin/env node

import commander from 'commander';

commander
  .command('upload <filePaths>', 'Upload customize files', {
    isDefault: true,
    executableFile: 'upload',
  })
  .command('download <device/customizeFileType/index>', 'Download customize file', {
    executableFile: 'download',
  })
  .command('remove <device/customizeFileType/index>', 'Remove customize file', {
    executableFile: 'remove',
  })
  .command('list', 'Show customize files list', {
    executableFile: 'list',
  })
  .parse(process.argv);
