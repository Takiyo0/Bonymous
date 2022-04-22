import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";
import passport from "passport";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class GoogleAuth extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/google/logout", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        if (!req.user) return res.json({ error: true, message: "You must login!" });
        req.logout();
        res.redirect("/");
    }
}