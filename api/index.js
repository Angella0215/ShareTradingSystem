// Vercel Node.js Function: reuse the existing Express routes unchanged.
// Local development continues to use `node backend/server.js` on port 5000.
module.exports = require('../backend/server');
