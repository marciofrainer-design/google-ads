"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
exports.authRoutes = (0, express_1.Router)();
const oauth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET, `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/callback`);
// GET /api/auth/url — gera a URL de autorização OAuth2
exports.authRoutes.get('/url', (_req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/adwords'],
        prompt: 'consent',
    });
    res.json({ data: { url } });
});
// GET /api/auth/callback — recebe o code e troca por refresh_token
exports.authRoutes.get('/callback', async (req, res) => {
    const code = req.query.code;
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
    }
    catch (err) {
        res.status(500).json({ error: { code: 'AUTH_ERROR', message: 'Falha ao obter token' } });
    }
});
//# sourceMappingURL=auth.routes.js.map