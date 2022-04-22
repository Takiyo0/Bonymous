import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class Threads extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/threads", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        let threads = await this.database.getFilteredThreads(req.user).catch(_ => null);
        if (!threads) return res.status(500).json({ error: true, message: "An error occured while fetching threads" });

        return res.json({ error: false, message: "Fetched threads", threadLength: threads.length, threads });
    }
}