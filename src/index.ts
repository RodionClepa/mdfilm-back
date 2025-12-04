import express, { Express, Request, Response } from "express";

const app: Express = express();
const port = process.env.PORT || 3000;

async function startServer() {
  app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!!');
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}

startServer();