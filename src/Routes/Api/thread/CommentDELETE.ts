import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class CommentDELETE extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/:id/comment/:commentId", db, "delete");
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


        const userHavePower = req.user ?
            req.user.isAdmin ? true : !!thread.moderators.find(u => u.id === req.user?.id)
            : false;

        if (!targetComment.author && !userHavePower) return res.status(404).json({ error: true, message: "Comment with anonymous user can't be deleted except by admin or thread moderator" });
        if (targetComment.author?.id !== req.user.id && !userHavePower) return res.status(404).json({ error: true, message: "Comment of another user can't be deleted except by admin or thread moderator" });

        const comment = await this.database.deleteCommentByThreadId(id, commentId).catch(_ => null);
        if (!comment) return res.status(500).json({ error: true, message: "Failed to delete comment" });

        return res.json({ error: false, message: "Comment deleted", thread: comment });
    }
}