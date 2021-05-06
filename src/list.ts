import commander from 'commander';
import { outputMessage } from './utils';
import { getSettings } from './settings';
import { getClient } from './client';

(async () => {
  commander.parse(process.argv);
  const client = await getClient();
  const settings = await getSettings();

  const customize = await client.app.getAppCustomize({ app: settings.appId });
  (['desktop', 'mobile'] as ('desktop' | 'mobile')[]).forEach((device) => {
    (['js', 'css'] as ('js' | 'css')[]).forEach((subContentType) => {
      outputMessage(`${device}-${subContentType}`);
      customize[device][subContentType].forEach((file) => {
        outputMessage(`|-${file.type === 'URL' ? file.url : file.file.name}`);
      });
      outputMessage('');
    });
  });
})();
