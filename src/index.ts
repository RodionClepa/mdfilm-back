import express, { Express, Request, Response } from "express";
import movieRoutes from "./routes/movie.route.js"

const app: Express = express();
const port = process.env.PORT || 3000;

app.use('/api/movies', movieRoutes);

async function startServer() {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}

startServer();