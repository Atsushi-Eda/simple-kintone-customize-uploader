import commander from 'commander';

commander
  .option('-b, --base-url <string>', 'Base-url of your kintone')
  .option('-u, --username <string>', 'Login username')
  .option('-p, --password <string>', "User's password")
  .option(
    '-o, --oauth-token <string>',
    'OAuth access token (If you set a set of --username and --password, this value is not necessary.)',
  )
  .option('-U, --basic-auth-username <string>', 'Basic Authentication username')
  .option('-P, --basic-auth-password <string>', 'Basic Authentication password')
  .option('-g, --guest-space-id <number>', 'Guest space id')
  .option('-a, --app-id <number>', 'App id')
  .option('-d, --no-desktop', "Don't apply to desktop")
  .option('-m, --no-mobile', "Don't apply to mobile")
  .option('-r, --no-rewrite', 'No rewrite')
  .option('-w, --watch', 'Watch the changes of customize files and re-run')
  .parse(process.argv);
const options = commander.opts();

export { options };
