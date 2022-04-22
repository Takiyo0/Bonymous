import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class ThreadPOST extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/", db, "post");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "Not logged in" });

        const { title, content, header, shortDescription, visibility } = req.body;

        if (!title || !content || !header || !shortDescription || !visibility) return res.status(400).json({ error: true, message: "Missing fields" });

        const id = this.generateId(12);
        const inviteLink = this.generateId(9);

        const thread = await this.database.createThread({
            title,
            content,
            header,
            shortDescription,
            visibility,
            id,
            inviteLink,
            createdAt: new Date(),
            lastActivity: new Date(),
            updatedAt: new Date(),
            author: req.user,
            comments: [],
            likes: 0,
            data: {},
            isDeleted: false,
            members: [req.user],
            moderators: [req.user]
        }).catch(_ => null);

        if (!thread) return res.status(500).json({ error: true, message: "An error occured while creating thread" });

        return res.json({ error: false, thread });
    }
}