# simple-kintone-customize-uploader

A kintone customize uploader without manifest.json

## Usage example

### Upload a customize file

```
npx simple-kintone-customize-uploader sample.js
```

### Automatically upload a customize file

```
npx simple-kintone-customize-uploader sample.js -w
```

### Automatically upload multiple customize files

```
npx simple-kintone-customize-uploader multiple sample.js,sample.css,sample.html -w
```

### Download customize file

```
npx simple-kintone-customize-uploader download desktop/js/0
```

### Remove customize file

```
npx simple-kintone-customize-uploader remove desktop/js/0
```

### Show customize files list

```
npx simple-kintone-customize-uploader list

desktop-js
|-sample1.js
|-sample2.js

desktop-css
|-sample.css

mobile-js
|-sample.js

mobile-css
|-sample.css
```

## Sub commands

| sub command | parameter                | description                                                                                                                              |
| ----------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| upload      | filePaths                | Upload customize files. Parameter is file paths. (comma separated string)                                                                |
| download    | device/contentType/index | Download customize file. Parameter is index of customize file. (device: desktop, mobile, any. contentType: js, css, html. index: number) |
| remove      | device/contentType/index | Remove customize file. Parameter is index of customize file. (device: desktop, mobile, any. contentType: js, css, html. index: number)   |
| list        | -                        | Show customize files list.                                                                                                               |

If you omit the subcommand, upload will be executed.

## Options

| option                    | description                                                                                      | corresponding subcommands      |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ |
| -b, --base-url            | Base-url of your kintone                                                                         | upload, download, remove, list |
| -u, --username            | Login username                                                                                   | upload, download, remove, list |
| -p, --password            | User's password                                                                                  | upload, download, remove, list |
| -o, --oauth-token         | OAuth access token (If you set a set of --username and --password, this value is not necessary.) | upload, download, remove, list |
| -U, --basic-auth-username | Basic Authentication username                                                                    | upload, download, remove, list |
| -P, --basic-auth-password | Basic Authentication password                                                                    | upload, download, remove, list |
| -g, --guest-space-id      | Guest space id                                                                                   | upload, download, remove, list |
| -a, --app-id              | App id                                                                                           | upload, download, remove, list |
| -d, --no-desktop          | Don't apply to desktop                                                                           | upload                         |
| -m, --no-mobile           | Don't apply to mobile                                                                            | upload                         |
| -w, --watch               | Watch the changes of customize files and re-run                                                  | upload                         |
| -h, --help                | display help for command                                                                         | upload, download, remove, list |

## Environment variables

| environment variable        | description                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| KINTONE_BASE_URL            | Base-url of your kintone                                                                                     |
| KINTONE_USERNAME            | Login username                                                                                               |
| KINTONE_PASSWORD            | User's password                                                                                              |
| KINTONE_OAUTH_TOKEN         | OAuth access token (If you set a set of KINTONE_BASE_URL and KINTONE_USERNAME, this value is not necessary.) |
| KINTONE_BASIC_AUTH_USERNAME | Basic Authentication username                                                                                |
| KINTONE_BASIC_AUTH_PASSWORD | Basic Authentication password                                                                                |
