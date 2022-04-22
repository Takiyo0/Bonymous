import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class SearchGET extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/search", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        const { q } = req.query;
        if (!q || typeof q !== "string") return res.status(400).json({ error: true, message: "No query provided" });

        const thread = await this.database.getFilteredThreadsWithQuery(req.user, req.query.q as string).catch(_ => null);
        if (!thread) return res.status(404).json({ error: true, message: "Thread not found" });

        return res.json({ error: false, message: `Found ${thread.length} threads`, thread });
    }
}