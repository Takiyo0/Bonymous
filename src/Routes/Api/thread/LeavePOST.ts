import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class LeavePOST extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/:id/leave", db, "post");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to leave a thread" });

        const { id } = req.params;
        if (!id) return res.status(400).json({ error: true, message: "No id provided" });

        const thread = await this.database.getThreadById(id).catch(_ => null);
        if (!thread) return res.status(404).json({ error: true, message: "Thread not found" });

        if (thread.visibility === "private") return res.status(403).json({ error: true, message: "This thread is private" });

        if (!thread.members.find(member => member.id === req.user?.id)) return res.status(403).json({ error: true, message: "You are not a member of this thread" });

        const leave = await this.database.leaveThreadById(id, req.user).catch(_ => null);
        if (!leave) return res.status(500).json({ error: true, message: "An error occured while leaving the thread" });

        return res.json({ error: false, message: "Successfully left the thread", thread: leave });
    }
}