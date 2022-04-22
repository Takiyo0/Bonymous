import BaseAPI from "../Base/BaseAPI";
import { Request, Response, NextFunction } from "express";

import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class List extends BaseAPI {
    constructor(db: DatabaseManager) {
        super("/list", db, "get");
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        const authorized = await new Promise(resolve => this.adminAuthorize(req, res, resolve));
        if (!authorized) return;

        const users = await this.database.getUsers().catch(_ => null);

        if (!users) return res.status(500).json({ error: true, message: "An error occured while fetching users" });

        return res.json({ error: false, userLength: users.length, users });
    }
}