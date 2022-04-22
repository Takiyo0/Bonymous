import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class Moderating extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/moderating", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to view this page" });

        let threads = await this.database.getThreadsThatUserIsModeratorOf(req.user).catch(_ => null);
        if (!threads) return res.status(500).json({ error: true, message: "An error occured while fetching threads" });

        return res.json({ error: false, message: "Fetched threads", threadsLength: threads.length, threads });
    }
}