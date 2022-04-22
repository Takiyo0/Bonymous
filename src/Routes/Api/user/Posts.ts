import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class Posts extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/posts", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to view this page" });

        let posts = await this.database.getThreadThatUserOwns(req.user).catch(_ => null);
        if (!posts) return res.status(500).json({ error: true, message: "An error occured while fetching posts" });

        return res.json({ error: false, message: "Fetched posts", postsLength: posts.length, posts });
    }
}