import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class Member extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/member", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.status(401).json({ error: true, message: "You must be logged in to view this page" });

        let member = await this.database.getThreadsThatUserIsMemberOf(req.user).catch(_ => null);
        if (!member) return res.status(500).json({ error: true, message: "An error occured while fetching member" });

        return res.json({ error: false, message: "Fetched member", memberLength: member.length, member });
    }
}