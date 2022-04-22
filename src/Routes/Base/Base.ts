import { Router, Request, Response } from "express";
import { User } from "../../Modules/Constants";

export default class Base {
    public router: Router;
    public route: string;
    public method: string;
    public adminAuthorize: Function;
    public eitherOwnerOrAdmin: Function;
    public moderatorAuthorize: Function;

    constructor(route: string, method = "get") {
        this.router = Router();
        this.route = route;
        this.method = method;


        this.adminAuthorize = async (req: Request, res: Response, next: Function): Promise<any> => {
            if (!req.user || !req.user.isAdmin) return res.json({ error: true, message: "You are not authorized to make a request to this route" });
            return next("continue");
        }

        this.eitherOwnerOrAdmin = async (req: Request, res: Response, next: Function, owner: User): Promise<any> => {
            if (!req.user) return res.json({ error: true, message: "You are not authorized to make a request to this route" });

            if (req.user.isAdmin) return next("continue");
            if (req.user.id === owner.id) return next("continue");
            return res.json({ error: true, message: "You are not authorized to make a request to this route" });
        }

        this.moderatorAuthorize = async (req: Request, res: Response, next: Function, moderators: User[], allowAdmin: boolean = false): Promise<any> => {
            if (!req.user) return res.json({ error: true, message: "You are not authorized to make a request to this route" });

            if (allowAdmin && req.user.isAdmin) return next("continue");

            if (moderators.find(u => u.id === req.user?.id)) return next("continue");
            return res.json({ error: true, message: "You are not authorized to make a request to this route" });
        }
    }

    run() {
        throw new Error("Method not implemented.");
    }
}