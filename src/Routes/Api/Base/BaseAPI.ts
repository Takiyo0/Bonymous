import { Router, Request, Response, NextFunction } from "express";

import { Methods } from "../../../Modules/Constants";
import DatabaseManager from "../../../Managers/Database";
import Api from "../../Api";

export default class BaseAPI {
    public router: Router;
    public route: string;
    public method: string;
    public db: DatabaseManager;

    constructor(route: string, db: DatabaseManager, method: Methods = "get") {
        this.router = Router();
        this.route = route;
        this.method = method;
        this.db = db;
    }

    async run(this: Api, req: Request, res: Response, next: NextFunction): Promise<any> {
        throw new Error("Method not implemented.");
    }
}