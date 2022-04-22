import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
const upload = multer({
    dest: 'uploads/', storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname))
        }
    })
});

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class UploadGET extends BaseAPI {

    constructor(db: DatabaseManager) {
        super("/upload", db, "post");

    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to upload" });

        const error = await new Promise(resolve => upload.single('image')(req, res, err => resolve(err)));

        if (error) return res.status(400).json({ error: true, message: "No file provided" });

        const file = req.file;
        if (!file) return res.status(400).json({ error: true, message: "No file provided" });

        const dbUpload = await this.sql.addUpload(file);
        if (!dbUpload) return res.status(500).json({ error: true, message: "Failed to upload file" });

        return res.json({ error: false, message: "File uploaded", url: `/api/file/${dbUpload.id}`, raw: dbUpload });
    }
}

declare module 'express' {
    interface Request {
        body: any // Actually should be something like `multer.Body`
        file: any // Actually should be something like `multer.Files`
    }
}