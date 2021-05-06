import { AppID, AppCustomizeForParameter, AppCustomizeForResponse } from '@kintone/rest-api-client/lib/client/types';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import watch from 'node-watch';
import commander from 'commander';
import { isUrl, getFileName, getExtension, castSubContentType, outputMessage } from './utils';
import { getUpdatableCustomize, sleepUntilDeployFinish } from './clientUtils';
import { getSettings } from './settings';
import { getClient } from './client';

const uploadCustomizeFiles = (
  client: KintoneRestAPIClient,
  filePaths: string[],
  desktop: boolean,
  mobile: boolean,
): Promise<string[][]> =>
  Promise.all(
    [desktop, mobile]
      .flat()
      .map((valid) =>
        Promise.all(
          filePaths.map(async (filePath) =>
            !valid || isUrl(filePath) ? '' : (await client.file.uploadFile({ file: { path: filePath } })).fileKey,
          ),
        ),
      ),
  );

const generateUpdateCustomizeParameterProperty = (
  appCustomizeResponse: AppCustomizeForResponse,
  filePaths: string[],
  fileKeys: string[],
  rewrite: boolean,
): AppCustomizeForParameter => {
  const appCustomizeParameter: AppCustomizeForParameter = appCustomizeResponse;
  filePaths.forEach((filePath, index) => {
    const subContentType = castSubContentType(getExtension(filePath));
    let removeIndex = -1;
    let insertIndex: number = appCustomizeResponse[subContentType].length;
    if (rewrite) {
      removeIndex = appCustomizeResponse[subContentType].findIndex(
        (file) =>
          (file.type === 'URL' && file.url === filePath) ||
          (file.type === 'FILE' && file.file.name === getFileName(filePath)),
      );
    }
    if (removeIndex >= 0) {
      (appCustomizeParameter[subContentType] || []).splice(removeIndex, 1);
      insertIndex = removeIndex;
    }
    (appCustomizeParameter[subContentType] || []).splice(
      insertIndex,
      0,
      fileKeys[index]
        ? {
            type: 'FILE',
            file: { fileKey: fileKeys[index] },
          }
        : {
            type: 'URL',
            url: filePath,
          },
    );
  });
  return appCustomizeParameter;
};

const updateCustomize = async (
  client: KintoneRestAPIClient,
  app: AppID,
  filePaths: string[],
  desktop: boolean,
  mobile: boolean,
  rewrite: boolean,
): Promise<void> => {
  outputMessage('Getting current customization setting on kintone app...');
  const customize = await getUpdatableCustomize(client, app);
  outputMessage('Uploading customization files...');
  const fileKeys = await uploadCustomizeFiles(client, filePaths, desktop, mobile);
  const updateCustomizeParameter: Parameters<KintoneRestAPIClient['app']['updateAppCustomize']>[0] = { app };
  if (desktop) {
    updateCustomizeParameter.desktop = generateUpdateCustomizeParameterProperty(
      customize.desktop,
      filePaths,
      fileKeys[0],
      rewrite,
    );
  }
  if (mobile) {
    updateCustomizeParameter.mobile = generateUpdateCustomizeParameterProperty(
      customize.mobile,
      filePaths,
      fileKeys[1],
      rewrite,
    );
  }
  outputMessage('Updating customize setting...');
  await client.app.updateAppCustomize(updateCustomizeParameter);
  await client.app.deployApp({ apps: [{ app }] });
  outputMessage('Wait for deploying completed...');
  await sleepUntilDeployFinish(client, app);
  outputMessage('Setting has been deployed!\n');
};

(async () => {
  commander.parse(process.argv);
  const filePaths = commander.args[0].split(',');
  const client = await getClient();
  const settings = await getSettings();

  await updateCustomize(client, settings.appId, filePaths, settings.desktop, settings.mobile, settings.rewrite);

  if (settings.watch) {
    let processing = false;
    outputMessage('Watching for file changes...');
    filePaths
      .filter((filePath) => !isUrl(filePath))
      .forEach((filePath) => {
        watch(filePath, async () => {
          if (processing) {
            return;
          }
          processing = true;
          await updateCustomize(client, settings.appId, filePaths, settings.desktop, settings.mobile, settings.rewrite);
          processing = false;
          outputMessage('Watching for file changes...');
        });
      });
  }
})();
