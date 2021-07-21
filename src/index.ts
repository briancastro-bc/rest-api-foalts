import 'source-map-support/register';
import 'module-alias/register';

// std
import * as http from 'http';

// 3p
import { Config, createApp, displayServerURL } from '@foal/core';
import * as cors from 'cors';
import * as express from 'express';

// App
import { AppController } from './app/app.controller';

async function main() {
  const expressApp = express();

  const app = await createApp(AppController);

  const httpServer = http.createServer(app);
  const port = Config.get('port', 'number', 3000);
  httpServer.listen(port, () => displayServerURL(port));
}

main()
  .catch(err => { console.error(err.stack); process.exit(1); });
