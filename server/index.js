import express from "express";
import cors from "cors";  // Import cors
import path from "path";
import { fileURLToPath } from 'url';  
import connectDB from './db.js';
import filesroute from './routes/files.js';
import show from './routes/show.js';
import download from './routes/download.js';

const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);  

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());  // Enable CORS
app.use(express.json());
connectDB();
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use('/api/files', filesroute);
app.use('/files', show);
app.use('/files/download', download);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
