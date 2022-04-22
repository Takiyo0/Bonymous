import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class CommentPOST extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/:id/comment", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: true, message: "No id provided" });

        const thread = await this.database.getThreadById(id).catch(_ => null);
        if (!thread) return res.status(404).json({ error: true, message: "Thread not found" });

        if (thread.visibility === "private" && thread.author.id !== req.user?.id) return res.status(403).json({ error: true, message: "This thread is private" });
        if (thread.visibility === "unlisted" && req.query.code !== thread.inviteLink && !thread.members.find(member => member.id === req.user?.id)) return res.status(403).json({ error: true, message: "You are not invited to this thread" });

        return res.json({ error: false, commentLength: thread.comments.length, comments: thread.comments });
    }
}