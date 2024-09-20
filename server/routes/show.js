import express from "express";
import file from "../models/file.js";  // Ensure the correct path with .js extension

const Router = express.Router();  // Initialize the Router

Router.get('/:uuid', async (req, res) => {
    try {
        const fileData = await file.findOne({ uuid: req.params.uuid });
        if (!fileData) {
            return res.render('download', { error: 'Link has expired' });
        }

        return res.render('download', {
            uuid: fileData.uuid,
            fileName: fileData.fileName,
            filesize: fileData.filesize,
            download: `${process.env.APP_BASE_URL}/files/download/${fileData.uuid}`
        });

    } catch (err) {
        return res.render('download', { error: 'Something went wrong' });
    }
});

export default Router;
