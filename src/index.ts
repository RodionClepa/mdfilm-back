import express, { Express } from "express";
import movieRoutes from "./routes/movie.route.js";
import mediaRoutes from "./routes/media.route.js";
import seriesRoutes from "./routes/series.route.js";
import seasonRoutes from "./routes/season.route.js";
import episodeRoutes from "./routes/episode.route.js";
import directorRoutes from "./routes/director.route.js";
import personRoutes from "./routes/person.route.js";

const app: Express = express();
app.use(express.json());        // for JSON bodies
app.use(express.urlencoded({ extended: true })); // for form data
const port = process.env.PORT || 3000;

app.use('/api/movies', movieRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/directors', directorRoutes);
app.use('/api/people', personRoutes);
// Season/Episode endpoints (nested + direct IDs)
app.use('/api', seasonRoutes);
app.use('/api', episodeRoutes);

async function startServer() {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}

startServer();