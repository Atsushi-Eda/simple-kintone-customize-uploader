"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const rest_api_client_1 = require("@kintone/rest-api-client");
const utils_1 = require("./utils");
const options_1 = require("./options");
const getClient = async () => {
    const { env } = process;
    const clientSettings = {
        baseUrl: options_1.options.baseUrl || env.KINTONE_BASE_URL,
        username: options_1.options.username || env.KINTONE_USERNAME,
        password: options_1.options.password || env.KINTONE_PASSWORD,
        oauthToken: options_1.options.password || env.KINTONE_OAUTH_TOKEN,
        basicAuthUsername: options_1.options.basicAuthUsername || env.KINTONE_BASIC_AUTH_USERNAME,
        basicAuthPassword: options_1.options.basicAuthPassword || env.KINTONE_BASIC_AUTH_PASSWORD,
        guestSpaceId: options_1.options.guestSpaceId,
    };
    clientSettings.baseUrl =
        clientSettings.baseUrl || (await utils_1.readUserInput("Input your kintone's base URL (https://example.cybozu.com): "));
    if (!clientSettings.username && !clientSettings.oauthToken) {
        clientSettings.username = await utils_1.readUserInput('Input your username: ');
    }
    if (!clientSettings.password && !clientSettings.oauthToken) {
        clientSettings.password = await utils_1.readUserInput('Input your password: ');
    }
    const client = new rest_api_client_1.KintoneRestAPIClient({
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
exports.getClient = getClient;
//# sourceMappingURL=client.js.map