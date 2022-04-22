import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class CodeGET extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/code/:code", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        const { code } = req.params;
        if (!code) return res.status(400).json({ error: true, message: "No code provided" });

        const thread = await this.database.getThreadByInviteCode(code).catch(_ => null);
        if (!thread) return res.status(404).json({ error: true, message: "Thread not found" });

        if (thread.visibility === "private" && thread.author.id !== req.user?.id) return res.status(403).json({ error: true, message: "This thread is private" });

        return res.json({ error: false, thread });
    }
}