import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class ThreadDELETE extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/:id", db, "delete");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to delete a thread" });

        const { id } = req.params;
        if (!id) return res.status(400).json({ error: true, message: "No id provided" });

        const thread = await this.database.getThreadById(id).catch(_ => null);
        if (!thread) return res.status(404).json({ error: true, message: "Thread not found" });

        const authorized = await new Promise(resolve => this.eitherOwnerOrAdmin(req, res, resolve, thread.author));
        if (!authorized) return;

        const _thread = await this.database.deleteThreadById(id).catch(_ => null);
        if (!_thread) return res.status(500).json({ error: true, message: "An error occured while deleting the thread" });

        return res.json({ error: false, thread: _thread });
    }
}