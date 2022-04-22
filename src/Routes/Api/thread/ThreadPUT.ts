import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class ThreadPUT extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/:id", db, "put");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to edit a thread" });

        const { id } = req.params;
        if (!id) return res.status(400).json({ error: true, message: "No id provided" });

        const thread = await this.database.getThreadById(id).catch(_ => null);
        if (!thread) return res.status(404).json({ error: true, message: "Thread not found" });

        const authorized = await new Promise(resolve => this.moderatorAuthorize(req, res, resolve, thread.moderators));
        if (!authorized) return;

        const { title, content, header, shortDescription, visibility } = req.body;

        if (!title && !content && !header && !shortDescription && !visibility) return res.status(400).json({ error: true, message: "No data provided" });

        const _thread = await this.database.updateThreadById(id, { title, content, header, shortDescription, visibility }).catch(_ => null);
        if (!_thread) return res.status(500).json({ error: true, message: "An error occured while updating the thread" });

        return res.json({ error: false, message: "Successfully updated the thread", thread: _thread });
    }
}