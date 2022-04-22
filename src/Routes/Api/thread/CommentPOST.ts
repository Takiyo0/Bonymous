import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class CommentPOST extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/:id/comment", db, "post");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: true, message: "No id provided" });

        const thread = await this.database.getThreadById(id).catch(_ => null);
        if (!thread) return res.status(404).json({ error: true, message: "Thread not found" });

        if (thread.visibility === "private" && thread.author.id !== req.user?.id) return res.status(403).json({ error: true, message: "This thread is private" });
        if (thread.visibility === "unlisted" && req.query.code !== thread.inviteLink && !thread.members.find(member => member.id === req.user?.id)) return res.status(403).json({ error: true, message: "You are not invited to this thread" });

        const { content, anonymous } = req.body;
        if (!content) return res.status(400).json({ error: true, message: "Missing fields" });

        const comment = await this.database.postCommentByThreadId(id, {
            content,
            author: anonymous ? null : req.user ? req.user : null,
            createdAt: new Date(),
            updatedAt: new Date(),
            id: this.generateId(6),
            isDeleted: false
        }).catch(_ => null);

        if (!comment) return res.status(500).json({ error: true, message: "Failed to post comment" });

        return res.json({ error: false, message: "Comment posted", thread: comment });
    }
}