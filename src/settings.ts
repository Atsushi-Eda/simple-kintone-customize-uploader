import { AppID } from '@kintone/rest-api-client/lib/client/types';
import { readUserInput } from './utils';
import { options } from './options';

interface Settings {
  appId: AppID;
  watch: boolean;
  desktop: boolean;
  mobile: boolean;
  rewrite: boolean;
}
const getSettings = async (): Promise<Settings> => {
  const settings = {
    appId: options.appId,
    watch: Boolean(options.watch),
    desktop: Boolean(options.desktop),
    mobile: Boolean(options.mobile),
    rewrite: Boolean(options.rewrite),
  };
  settings.appId = Number(settings.appId || (await readUserInput('Input your app id: ')));
  return settings;
};
export { getSettings };
