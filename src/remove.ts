import commander from 'commander';
import { castDevice, castSubContentType, outputMessage } from './utils';
import { getUpdatableCustomize, sleepUntilDeployFinish } from './clientUtils';
import { getSettings } from './settings';
import { getClient } from './client';

(async () => {
  commander.parse(process.argv);
  const device = castDevice(commander.args[0].split('/')[0]);
  const subContentType = castSubContentType(commander.args[0].split('/')[1]);
  const index = Number(commander.args[0].split('/')[2]);
  const client = await getClient();
  const settings = await getSettings();

  outputMessage('Getting current customization setting on kintone app...');
  const customize = await getUpdatableCustomize(client, settings.appId);
  const [removedFile] = customize[device][subContentType].splice(index, 1);
  outputMessage('Updating customize setting...');
  await client.app.updateAppCustomize({
    app: settings.appId,
    [device]: {
      [subContentType]: customize[device][subContentType],
    },
  });
  await client.app.deployApp({ apps: [{ app: settings.appId }] });
  outputMessage('Wait for deploying completed...');
  await sleepUntilDeployFinish(client, settings.appId);
  outputMessage('Setting has been deployed!');
  outputMessage(`Removed ${removedFile.type === 'URL' ? removedFile.url : removedFile.file.name}`);
})();
