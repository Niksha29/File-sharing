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
        // Generate unique name for the file
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

let upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 },
}).single('myfile');

const router = Router();  // Define router

router.post('/', (req, res) => {
    
    upload(req, res, async (err) => {
        //validate requesst
        
        if (!req.file) {
            return res.json({ error: 'all fields are required' });
        }

        if (err) {
            return res.status(500).send({ error: err.message });
        }
        // Store into the database
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),  // Use uuid v4 to generate the uuid
            path: req.file.path,
            size: req.file.size
        });

        const response = await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
    });
});

router.post('/send',async (req,res)=>{

    const {uuid,emailto,emailfrom}=req.body;
    if(!uuid || !emailto ||!emailfrom){
        return res.status(422).send({error:'all feilds are required.'});
    }

    //get data from db
    const file =await File.findOne({uuid:uuid});
    if(file.sender){
        return res.status(422).send({error:'email already sent'});
    }

    file.sender=emailfrom;
    file.receiver=emailto;

    const response =await file.save();

    //send mail
    sendMail({
        from:emailfrom,
        to:emailto,
        subject:'inshare file sharing',
        text:`${emailfrom} shared a file with you`,
        html: emailTemplate({
            emailFrom:emailfrom,
            downloadLink:`${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size/1000)+'KB',
            expires:'24 hours'
        })
    });
    return res.send({success:true})
    

})


export default router;  // Export the router
