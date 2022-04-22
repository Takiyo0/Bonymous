import Base from "./Base/Base";
import { static as expressStatic } from "express";
import path from "path";
import { Router } from "express";

export default class Main extends Base {
    constructor() {
        super("/");
    }

    run(): Router {
        // express static to public/public
        this.router.use(expressStatic(path.join(__dirname, "../../public")));

        this.router.get("*", (req, res) => {
            res.sendFile(path.resolve(__dirname, "../../public/index.html"));
        });

        return this.router;
    }
}