import express from "express";
import path from "path";
import { fileURLToPath } from 'url';  // Import to handle ES module scope

import connectDB from './db.js';
import filesroute from './routes/files.js';
import show from './routes/show.js';
import download from './routes/download.js';
const __filename = fileURLToPath(import.meta.url);  // Create __filename
const __dirname = path.dirname(__filename);  // Create __dirname

const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());
connectDB();
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use('/api/files', filesroute);
app.use('/files', show);
app.use('/files/download',download);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
