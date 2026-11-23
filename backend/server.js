require('dotenv').config();
const express = require('express');
const cors = require('cors');  // <-- ADD THIS LINE
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const investorRoutes = require('./routes/investorRoutes');
const companyRoutes = require('./routes/companyRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const statementRoutes = require('./routes/statementRoutes');
const auditRoutes = require('./routes/auditRoutes');
const dividendRoutes = require('./routes/dividendRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(x => x.trim()) }));
app.use(express.json({ limit: '100kb' }));


app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use('/api', authRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/statements', statementRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dividends', dividendRoutes);
app.use('/api/files', fileRoutes);

// Turns upload errors (wrong file type, file too large) into a readable JSON message.
app.use((err, req, res, next) => {
    if (err) {
        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'Each file must be 5 MB or smaller.'
            : err.message;
        return res.status(400).json({ message });
    }
    next();
});

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ status: 'ok', database: 'connected', result: rows[0].result });
    } catch (error) {
        res.status(503).json({ status: 'error', database: 'unavailable', message: 'Database connection failed. Check DATABASE_URL.' });
    }
});

// Start a TCP listener only for local Node.js runs. Vercel imports this app
// as a serverless handler from api/index.js without opening a local port.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;