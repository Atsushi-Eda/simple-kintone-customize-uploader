import commander from 'commander';
import fs from 'fs';
import { castDevice, castCustomizeFileType, outputMessage, isHtml } from './utils';
import { getSettings } from './settings';
import { getClient } from './client';

(async () => {
  commander.parse(process.argv);
  const device = castDevice(commander.args[0].split('/')[0]);
  const [, contentType] = commander.args[0].split('/');
  const index = Number(commander.args[0].split('/')[2]);
  const client = await getClient();
  const settings = await getSettings();

  if (!isHtml(contentType)) {
    const customizeFileType = castCustomizeFileType(contentType);
    const customize = await client.app.getAppCustomize({ app: settings.appId });
    const file = customize[device][customizeFileType][index];
    if (!file || file.type === 'URL') {
      outputMessage('File does not exist.');
      return;
    }
    fs.writeFileSync(file.file.name, Buffer.from(await client.file.downloadFile({ fileKey: file.file.fileKey })));
    outputMessage(`Downloaded ${file.file.name}`);
  } else {
    const { views } = await client.app.getViews({ app: settings.appId });
    const targetView = Object.values(views).find((view) => Number(view.index) === index);
    if (!targetView || targetView.type !== 'CUSTOM') {
      outputMessage('Not customized view.');
      return;
    }
    fs.writeFileSync(`${targetView.name}.html`, targetView.html);
    outputMessage(`Downloaded ${targetView.name}.html`);
  }
})();
