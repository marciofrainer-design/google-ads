import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { type Request, type Response } from 'express';
import { campaignRoutes } from './routes/campaigns.routes';
import { adGroupRoutes } from './routes/adGroups.routes';
import { adRoutes } from './routes/ads.routes';
import { metricsRoutes } from './routes/metrics.routes';
import { authRoutes } from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './config/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Lista de origens permitidas (segurança OWASP A5)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o: string) => o.trim());

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Segurança: cabeçalhos HTTP (OWASP A5/A6)
app.use(helmet());

// Parse JSON com limite para evitar DoS (OWASP A4)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging de requisições
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/ad-groups', adGroupRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/metrics', metricsRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handler de erros centralizado
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
