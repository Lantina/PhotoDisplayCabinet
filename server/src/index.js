require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { initDb } = require('./config/db');
const photoRoutes = require('./routes/photoRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((item) => item.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'), {
    maxAge: '30d',
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

async function bootstrap() {
  await initDb();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('启动失败', error);
  process.exit(1);
});

