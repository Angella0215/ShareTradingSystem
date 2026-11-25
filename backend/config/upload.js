const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Absolute path to backend/uploads, created automatically if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extValid) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, and PDF files are allowed.'));
        }
    }
});

const uploadPdf = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
    fileFilter: function (req, file, cb) {
        const extValid = path.extname(file.originalname).toLowerCase() === '.pdf';
        const typeValid = file.mimetype === 'application/pdf';
        if (extValid && typeValid) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for account documents.'));
        }
    }
});

module.exports = upload;
module.exports.pdfOnly = uploadPdf;
module.exports.uploadDir = uploadDir;