import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import { readUserInput } from './utils';
import { options } from './options';

const getClient = async (): Promise<KintoneRestAPIClient> => {
  const { env } = process;
  const clientSettings = {
    baseUrl: options.baseUrl || env.KINTONE_BASE_URL,
    username: options.username || env.KINTONE_USERNAME,
    password: options.password || env.KINTONE_PASSWORD,
    oauthToken: options.password || env.KINTONE_OAUTH_TOKEN,
    basicAuthUsername: options.basicAuthUsername || env.KINTONE_BASIC_AUTH_USERNAME,
    basicAuthPassword: options.basicAuthPassword || env.KINTONE_BASIC_AUTH_PASSWORD,
    guestSpaceId: options.guestSpaceId,
  };
  clientSettings.baseUrl =
    clientSettings.baseUrl || (await readUserInput("Input your kintone's base URL (https://example.cybozu.com): "));
  if (!clientSettings.username && !clientSettings.oauthToken) {
    clientSettings.username = await readUserInput('Input your username: ');
  }
  if (!clientSettings.password && !clientSettings.oauthToken) {
    clientSettings.password = await readUserInput('Input your password: ');
  }

  const client = new KintoneRestAPIClient({
    baseUrl: clientSettings.baseUrl,
    auth: {
      username: clientSettings.username,
      password: clientSettings.password,
      oAuthToken: clientSettings.oauthToken,
    },
    basicAuth: {
      username: clientSettings.basicAuthUsername,
      password: clientSettings.basicAuthPassword,
    },
    guestSpaceId: clientSettings.guestSpaceId,
  });
  return client;
};
export { getClient };
