import { Router } from "express";
import multer from "multer";
import { v4 as uuid4 } from 'uuid';  
import path from 'path';  
import File from '../models/file.js'; 
import sendMail from "../services/emailservice.js";
import emailTemplate from '../services/emailtemplate.js';

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

let upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 },
}).single('file'); // Updated 'file' to match the frontend

const router = Router();  // Define router

// File Upload Route
router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        // Validate request
        if (!req.file) {
            return res.status(400).json({ error: 'File is required' });
        }

        if (err) {
            return res.status(500).send({ error: err.message });
        }

        // Store into the database
        try {
            const file = new File({
                filename: req.file.filename,
                uuid: uuid4(),  // Use uuid v4 to generate the uuid
                path: req.file.path,
                size: req.file.size
            });

            const response = await file.save();
            return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
        } catch (dbErr) {
            return res.status(500).json({ error: 'Database error' });
        }
    });
});

// Email Sending Route
router.post('/send', async (req, res) => {
    const { uuid, emailto, emailfrom } = req.body;

    if (!uuid || !emailto || !emailfrom) {
        return res.status(422).send({ error: 'All fields are required.' });
    }

    try {
        // Get data from DB
        const file = await File.findOne({ uuid: uuid });

        if (!file) {
            return res.status(404).send({ error: 'File not found' });
        }

        // if (file.sender) {
        //     return res.status(422).send({ error: 'Email already sent.' });
        // }

        // Save email sender and receiver
        file.sender = emailfrom;
        file.receiver = emailto;
        await file.save();

        // Send email
        await sendMail({
            from: emailfrom,
            to: emailto,
            subject: 'InShare File Sharing',
            text: `${emailfrom} shared a file with you`,
            html: emailTemplate({
                emailFrom: emailfrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
                size: parseInt(file.size / 1000) + 'KB',
                expires: '24 hours',
            }),
        });

        return res.send({ success: true });
    } catch (err) {
        return res.status(500).send({ error: 'Something went wrong' });
    }
});

export default router;
