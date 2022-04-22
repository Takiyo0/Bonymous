import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class ListGET extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/list", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        const authorized = await new Promise(resolve => this.adminAuthorize(req, res, resolve));
        if (!authorized) return;

        const thread = await this.database.getThreads().catch(_ => null);
        if (!thread) return res.status(500).json({ error: true, message: "An error occured while fetching threads" });

        return res.json({ error: false, threadLength: thread.length, thread });
    }
}