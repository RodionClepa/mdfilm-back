import 'dotenv/config';
import express, { Express } from "express";
import path from 'node:path';
import movieRoutes from "./routes/movie.route.js";
import mediaRoutes from "./routes/media.route.js";
import seriesRoutes from "./routes/series.route.js";
import seasonRoutes from "./routes/season.route.js";
import episodeRoutes from "./routes/episode.route.js";
import directorRoutes from "./routes/director.route.js";
import personRoutes from "./routes/person.route.js";
import homepageRoutes from "./routes/homepage.route.js";
import authRoutes from "./routes/auth.route.js";
import bookmarkRoutes from "./routes/bookmark.route.js";
import newsRoutes from "./routes/news.route.js";
import adminImportRoutes from "./routes/adminImport.route.js";

const app: Express = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());        // for JSON bodies
app.use(express.urlencoded({ extended: true })); // for form data

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
const port = process.env.PORT || 3000;

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminImportRoutes);

app.use('/api/bookmarks', bookmarkRoutes);

app.use('/api/movies', movieRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/directors', directorRoutes);
app.use('/api/people', personRoutes);
app.use('/api/news', newsRoutes);

// Season/Episode endpoints (nested + direct IDs)
app.use('/api', seasonRoutes);
app.use('/api', episodeRoutes);

async function startServer() {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}

startServer();