import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

export const authRoutes = Router();

/**
 * @openapi
 * /api/auth/url:
 *   get:
 *     tags: [Auth]
 *     summary: Gera URL de autorização OAuth2
 *     description: Retorna a URL para o usuário autorizar o acesso ao Google Ads via OAuth2.
 *     responses:
 *       200:
 *         description: URL de autorização gerada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://accounts.google.com/o/oauth2/auth?..."
 */

/**
 * @openapi
 * /api/auth/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Callback OAuth2 — troca code por refresh_token
 *     description: Recebe o `code` retornado pelo Google e o troca por um `refresh_token`.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de autorização retornado pelo Google.
 *     responses:
 *       200:
 *         description: Autenticação concluída com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *       400:
 *         description: Parâmetro `code` ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Falha ao obter token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
