import express from "express";
import file from "../models/file.js";
import path from "path";
import { fileURLToPath } from 'url';

const Router = express.Router();  // Initialize the Router

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Router.get('/:uuid', async (req, res) => {
    try {
        const fileData = await file.findOne({ uuid: req.params.uuid });
        
        if (!fileData) {
            return res.render('download', { error: 'Link has expired' });
        }

        const filepath = path.join(__dirname, `../${fileData.path}`);
        res.download(filepath);

    } catch (err) {
        return res.render('download', { error: 'Something went wrong' });
    }
});

export default Router;
