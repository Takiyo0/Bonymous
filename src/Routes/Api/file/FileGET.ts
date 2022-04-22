import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs-extra";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class FileGET extends BaseAPI {

    constructor(db: DatabaseManager) {
        super("/:id", db, "get");

    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: true, message: "No id provided" });

        const file = await this.sql.getUploadById(id);
        if (!file || !file.length || !file[0]) return res.status(404).json({ error: true, message: "File not found" });

        // check if the image is exist
        const filePath = path.join(__dirname, "../../../../uploads", file[0].filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: true, message: "File not found" });
        
        res.contentType(file[0].mimetype);
        return res.sendFile(filePath);
    }
}

declare module 'express' {
    interface Request {
        body: any // Actually should be something like `multer.Body`
        file: any // Actually should be something like `multer.Files`
    }
}