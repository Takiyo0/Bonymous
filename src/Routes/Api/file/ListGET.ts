import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs-extra";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class ListGET extends BaseAPI {

    constructor(db: DatabaseManager) {
        super("/list", db, "get");

    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to see uploaded files" });
        if (!req.user.isAdmin) return res.status(401).json({ error: true, message: "You must be admin to see uploaded files" });

        const files = await this.sql.getUploads();
        if (!files || !files.length) return res.status(404).json({ error: true, message: "No files found" });

        return res.json({ error: false, message: "Files found", filesLength: files.length, files });
    }
}