import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class JoinPOST extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/:id/join", db, "post");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to join a thread" });

        const { id } = req.params;
        if (!id) return res.status(400).json({ error: true, message: "No id provided" });

        const thread = await this.database.getThreadById(id).catch(_ => null);
        if (!thread) return res.status(404).json({ error: true, message: "Thread not found" });

        if (thread.visibility === "private") return res.status(403).json({ error: true, message: "This thread is private" });
        if (thread.visibility === "unlisted" && req.query.code !== thread.inviteLink) return res.status(403).json({ error: true, message: "You are not invited to this thread" });

        if (thread.members.find(member => member.id === req.user?.id)) return res.status(403).json({ error: true, message: "You are already a member of this thread" });

        const join = await this.database.joinThreadById(id, req.user).catch(_ => null);
        if (!join) return res.status(500).json({ error: true, message: "An error occured while joining the thread" });

        return res.json({ error: false, message: "Successfully joined the thread", thread: join });
    }
}