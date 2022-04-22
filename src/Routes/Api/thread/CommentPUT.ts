import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class CommentPUT extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/:id/comment/:commentId", db, "put");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You are not authorized to make a request to this route" });

        const { id, commentId } = req.params;
        if (!id || !commentId) return res.status(400).json({ error: true, message: "No id provided" });

        const thread = await this.database.getThreadById(id).catch(_ => null);
        if (!thread) return res.status(404).json({ error: true, message: "Thread not found" });

        if (!thread.comments.find(comment => comment.id === commentId)) return res.status(404).json({ error: true, message: "Comment not found" });

        const targetComment = thread.comments.find(comment => comment.id === commentId);
        if (!targetComment) return res.status(404).json({ error: true, message: "Comment not found" });

        if (!targetComment.author || targetComment.author.id !== req.user.id) return res.status(404).json({ error: true, message: "Comment of another user can't be edited" });

        const { content } = req.body;
        if (!content) return res.status(400).json({ error: true, message: "Missing fields" });

        const comment = await this.database.updateCommentContentByThreadId(id, targetComment.id, content).catch(_ => null);
        if (!comment) return res.status(500).json({ error: true, message: "Failed to update comment" });

        return res.json({ error: false, message: "Comment updated", thread: comment });
    }
}