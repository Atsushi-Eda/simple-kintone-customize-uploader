import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import { AppID } from '@kintone/rest-api-client/lib/client/types';
import { sleepBy } from './utils';

async function copyFile(client: KintoneRestAPIClient, file: { name: string; fileKey: string }): Promise<string> {
  return (
    await client.file.uploadFile({
      file: {
        name: file.name,
        data: await client.file.downloadFile({ fileKey: file.fileKey }),
      },
    })
  ).fileKey;
}

export async function getUpdatableCustomize(
  client: KintoneRestAPIClient,
  app: AppID,
): ReturnType<KintoneRestAPIClient['app']['getAppCustomize']> {
  const customize = await client.app.getAppCustomize({ app });
  const customizeChunks = await Promise.all(
    (['desktop', 'mobile'] as ('desktop' | 'mobile')[]).map((device) =>
      Promise.all(
        (['js', 'css'] as ('js' | 'css')[]).map((subContentType) =>
          Promise.all(
            customize[device][subContentType].map(async (file) =>
              file.type !== 'FILE'
                ? file
                : {
                    type: 'FILE' as const,
                    file: {
                      ...file.file,
                      fileKey: await copyFile(client, file.file),
                    },
                  },
            ),
          ),
        ),
      ),
    ),
  );
  [[customize.desktop.js, customize.desktop.css], [customize.mobile.js, customize.mobile.css]] = customizeChunks;
  return customize;
}

export async function sleepUntilDeployFinish(client: KintoneRestAPIClient, appId: AppID): Promise<void> {
  sleepBy(async () => {
    const status = await client.app.getDeployStatus({ apps: [appId] }).then((response) => response.apps[0].status);
    return status !== 'PROCESSING';
  }, 1000);
}
