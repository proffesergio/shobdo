import { createApp } from './app.mjs';
import { loadConfig } from './config.mjs';

const config = loadConfig();
const server = createApp(config);
server.on('error', error => {
  console.error(`API startup failed (${error.code ?? 'UNKNOWN'}). Check host and port configuration.`);
  process.exitCode = 1;
});
server.listen(config.port, config.host, () => console.log(`Shobdo API listening on http://${config.host}:${config.port}; inference not implemented.`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => { process.exitCode = 0; });
    server.closeAllConnections();
  });
}
