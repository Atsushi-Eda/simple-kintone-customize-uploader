import { AppID, AppCustomizeForParameter, AppCustomizeForResponse } from '@kintone/rest-api-client/lib/client/types';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import watch from 'node-watch';
import fs from 'fs';
import commander from 'commander';
import {
  isUrl,
  isHtml,
  getFileName,
  getExtension,
  getFileNameWithoutExtension,
  castCustomizeFileType,
  outputMessage,
} from './utils';
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
): AppCustomizeForParameter => {
  const appCustomizeParameter: AppCustomizeForParameter = appCustomizeResponse;
  filePaths.forEach((filePath, index) => {
    const customizeFileType = castCustomizeFileType(getExtension(filePath));
    let removeIndex = -1;
    let insertIndex: number = appCustomizeResponse[customizeFileType].length;
    removeIndex = appCustomizeResponse[customizeFileType].findIndex(
      (file) =>
        (file.type === 'URL' && file.url === filePath) ||
        (file.type === 'FILE' && file.file.name === getFileName(filePath)),
    );
    if (removeIndex >= 0) {
      (appCustomizeParameter[customizeFileType] || []).splice(removeIndex, 1);
      insertIndex = removeIndex;
    }
    (appCustomizeParameter[customizeFileType] || []).splice(
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
): Promise<void> => {
  if (!filePaths.length) {
    return;
  }
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
    );
  }
  if (mobile) {
    updateCustomizeParameter.mobile = generateUpdateCustomizeParameterProperty(
      customize.mobile,
      filePaths,
      fileKeys[1],
    );
  }
  outputMessage('Updating customize setting...');
  await client.app.updateAppCustomize(updateCustomizeParameter);
};

const updateViews = async (
  client: KintoneRestAPIClient,
  app: AppID,
  filePaths: string[],
  mobile: boolean,
): Promise<void> => {
  if (!filePaths.length) {
    return;
  }
  outputMessage('Getting current views setting on kintone app...');
  const { views } = await client.app.getViews({ app });
  const updateViewsParameter: Parameters<KintoneRestAPIClient['app']['updateViews']>[0] = { app, views };
  filePaths.forEach((filePath) => {
    const viewName = getFileNameWithoutExtension(filePath);
    const html = fs.readFileSync(filePath, 'utf8');
    if (viewName in updateViewsParameter.views) {
      const view = updateViewsParameter.views[viewName];
      if (view.type === 'CUSTOM') {
        view.html = html;
      }
    } else {
      updateViewsParameter.views[viewName] = {
        type: 'CUSTOM',
        name: viewName,
        index: String(Object.keys(updateViewsParameter.views).length),
        html,
        device: mobile ? 'ANY' : 'DESKTOP',
      };
    }
  });
  outputMessage('Updating views setting...');
  await client.app.updateViews(updateViewsParameter);
};

const deployApp = async (client: KintoneRestAPIClient, app: AppID): Promise<void> => {
  await client.app.deployApp({ apps: [{ app }] });
  outputMessage('Wait for deploying completed...');
  await sleepUntilDeployFinish(client, app);
  outputMessage('Setting has been deployed!\n');
};

(async () => {
  commander.parse(process.argv);
  const filePaths = commander.args[0].split(',');
  const customizeFilePaths = filePaths.filter((filePath) => !isHtml(getExtension(filePath)));
  const viewFilePaths = filePaths.filter((filePath) => isHtml(getExtension(filePath)));
  const client = await getClient();
  const settings = await getSettings();

  await updateCustomize(client, settings.appId, customizeFilePaths, settings.desktop, settings.mobile);
  await updateViews(client, settings.appId, viewFilePaths, settings.mobile);
  await deployApp(client, settings.appId);

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
          await updateCustomize(client, settings.appId, customizeFilePaths, settings.desktop, settings.mobile);
          await updateViews(client, settings.appId, viewFilePaths, settings.mobile);
          await deployApp(client, settings.appId);
          processing = false;
          outputMessage('Watching for file changes...');
        });
      });
  }
})();
