import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class ModeratorPOST extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/:id/moderator", db, "post");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to like a thread" });

        const { id } = req.params;
        if (!id) return res.status(400).json({ error: true, message: "No id provided" });

        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: true, message: "No userId provided" });

        if (req.user.id === userId) return res.status(400).json({ error: true, message: "You can't add yourself as a moderator" });

        const [thread, user] = await Promise.all([this.database.getThreadById(id).catch(_ => null), this.database.getUserById(userId).catch(_ => null)]);
        if (!thread || !user) return res.status(404).json({ error: true, message: "Found neither thread nor user" });

        if (thread.visibility === "private") return res.status(403).json({ error: true, message: "This thread is private" });
        if (!thread.moderators.find(u => u.id === req.user?.id)) return res.status(403).json({ error: true, message: "You are not a moderator of this thread" });

        if (thread.moderators.find(u => u.id === userId)) return res.status(400).json({ error: true, message: "User is already a moderator" });

        const _thread = await this.database.addModeratorToThreadById(id, user).catch(_ => null);
        if (!_thread) return res.status(500).json({ error: true, message: "An error occured while adding the moderator" });

        return res.json({ error: false, message: "Successfully joined the thread", thread: _thread });
    }
}