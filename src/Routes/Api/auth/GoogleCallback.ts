import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";
import passport from "passport";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class GoogleCallbackAuth extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/google/callback", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        res.redirect("/api/auth/google/secret");
    }
}