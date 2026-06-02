const express = require('express');
const cors = require('cors');
const { query } = require('./config/db');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const { devRouter } = require('./routes/dev.routes');
const { authRouter } = require('./routes/auth.routes');
const { gamesRouter } = require('./routes/games.routes');
const { genresRouter } = require('./routes/genres.routes');
const { platformsRouter } = require('./routes/platforms.routes');
const { myGamesRouter } = require('./routes/myGames.routes');
const { gameReviewsRouter } = require('./routes/gameReviews.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api', authRouter);
if (process.env.NODE_ENV !== 'production') {
  app.use('/api', devRouter);
}
app.use('/api/games', gamesRouter);
app.use('/api/genres', genresRouter);
app.use('/api/platforms', platformsRouter);
app.use('/api/my-games', myGamesRouter);
app.use('/api', gameReviewsRouter);

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, service: 'savestate-retro-backlog', db: true });
  } catch {
    res.json({ ok: true, service: 'savestate-retro-backlog', db: false });
  }
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
