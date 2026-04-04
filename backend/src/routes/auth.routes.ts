import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

export const authRoutes = Router();

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/callback`
);

// GET /api/auth/url — gera a URL de autorização OAuth2
authRoutes.get('/url', (_req: Request, res: Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/adwords'],
    prompt: 'consent',
  });
  res.json({ data: { url } });
});

// GET /api/auth/callback — recebe o code e troca por refresh_token
authRoutes.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: { code: 'MISSING_CODE', message: 'Parâmetro code ausente' } });
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Em produção: armazene o refresh_token de forma segura (banco de dados criptografado)
    // Nunca exponha o token em logs ou respostas sem necessidade
    res.json({
      data: {
        message: 'Autenticação concluída. Copie o refresh_token para o .env',
        refresh_token: tokens.refresh_token,
      },
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'AUTH_ERROR', message: 'Falha ao obter token' } });
  }
});
