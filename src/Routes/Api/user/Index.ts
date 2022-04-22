import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class Index extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        res.json({ error: false, loggedIn: !!req.user, user: req.user });
    }
}