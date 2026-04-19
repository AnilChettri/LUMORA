import { app, httpServer, setupApp } from "../server/index";

export default async function handler(req: any, res: any) {
  await setupApp(app, httpServer);
  return app(req, res);
}
