import commander from 'commander';
import fs from 'fs';
import { castDevice, castSubContentType, outputMessage } from './utils';
import { getSettings } from './settings';
import { getClient } from './client';

(async () => {
  commander.parse(process.argv);
  const device = castDevice(commander.args[0].split('/')[0]);
  const subContentType = castSubContentType(commander.args[0].split('/')[1]);
  const index = Number(commander.args[0].split('/')[2]);
  const client = await getClient();
  const settings = await getSettings();

  const customize = await client.app.getAppCustomize({ app: settings.appId });
  const file = customize[device][subContentType][index];
  if (!file || file.type === 'URL') {
    outputMessage('File does not exist');
    return;
  }
  fs.writeFileSync(file.file.name, Buffer.from(await client.file.downloadFile({ fileKey: file.file.fileKey })));
  outputMessage(`Downloaded ${file.file.name}`);
})();
