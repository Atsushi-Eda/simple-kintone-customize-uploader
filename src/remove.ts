import commander from 'commander';
import { castDevice, castCustomizeFileType, outputMessage, isHtml, readUserInput } from './utils';
import { getUpdatableCustomize, sleepUntilDeployFinish } from './clientUtils';
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
    outputMessage('Getting current customization setting on kintone app...');
    const customize = await getUpdatableCustomize(client, settings.appId);
    const [removedFile] = customize[device][customizeFileType].splice(index, 1);
    if (
      !removedFile ||
      (await readUserInput(
        `Do you remove ${
          removedFile.type === 'URL' ? removedFile.url : removedFile.file.name
        } in ${device}-${customizeFileType}?(Y/n): `,
      )) === 'n'
    ) {
      outputMessage('Did not remove.');
      return;
    }
    outputMessage('Updating customize setting...');
    await client.app.updateAppCustomize({
      app: settings.appId,
      [device]: {
        [customizeFileType]: customize[device][customizeFileType],
      },
    });
  } else {
    outputMessage('Getting current views setting on kintone app...');
    const { views } = await client.app.getViews({ app: settings.appId });
    const removedView = Object.values(views).find((view) => Number(view.index) === index);
    if (!removedView || (await readUserInput(`Do you remove ${removedView.name} in views?(Y/n): `)) === 'n') {
      outputMessage('Did not remove.');
      return;
    }
    delete views[removedView.name];
    outputMessage('Updating views setting...');
    await client.app.updateViews({
      app: settings.appId,
      views,
    });
  }
  await client.app.deployApp({ apps: [{ app: settings.appId }] });
  outputMessage('Wait for deploying completed...');
  await sleepUntilDeployFinish(client, settings.appId);
  outputMessage('Setting has been deployed!');
})();
