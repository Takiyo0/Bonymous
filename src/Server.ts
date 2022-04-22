import express from 'express';
import bodyParser from 'body-parser';
import Logger from './Modules/Logger';

import fs from "fs-extra";

export default class Server {
    public app: express.Application;
    public port: number;

    constructor(port: number) {
        this.port = port;
        this.app = express();
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
    }

    start(callback: Function) {
        this.loadRoutes();
        this.app.listen(this.port, callback());
    }

    loadRoutes() {
        const routes = fs.readdirSync(__dirname + "/Routes", { withFileTypes: true });
        for (let route of routes) {
            if (route.isDirectory()) continue;
            let routeClass = require(`./Routes/${route.name}`).default;
            routeClass = new routeClass();
            this.app.use(routeClass.route, routeClass.run());
            Logger.log(`Loaded ${route.name}`, 'debug');
        }
    }
}