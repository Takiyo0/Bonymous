import Base from "./Base/Base";
import { Router, Request, Response, NextFunction } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Strategy } from "passport-google-oauth20";
import fs from "fs-extra";

import DatabaseManager from "../Managers/Database";
import Logger from '../Modules/Logger';
import { Methods, User } from "../Modules/Constants";
import passport from "passport";
import user from "../Models/User";
import { SECRET, MONGODB_URI, GOOGLE, DATABASE_TYPE } from "../../config";
import SQLManager from "../Managers/SQL";

export default class Api extends Base {
    database: DatabaseManager;
    generateId: Function;
    sql: SQLManager;

    constructor() {
        super("/api");

        this.router.use(session({
            secret: SECRET,
            cookie: {
                maxAge: 60000 * 60 * 24
            },
            proxy: true,
            saveUninitialized: true,
            name: 'board-session',
            resave: true,
            store: MongoStore.create({
                mongoUrl: MONGODB_URI,
                collectionName: 'express-sessions',
                stringify: true
            })
        }));
        this.router.use(passport.initialize());
        this.router.use(passport.session());

        this.database = new DatabaseManager();
        this.generateId = this._generateId;
        this.database.connect();

        this.sql = new SQLManager(DATABASE_TYPE ? DATABASE_TYPE : "SQLite");

        passport.use(new Strategy({
            clientID: GOOGLE.client_id,
            clientSecret: GOOGLE.client_secret,
            callbackURL: `http://localhost:4000/api/auth/google/callback`
        }, async (accessToken, refreshToken, profile, done) => {
            let { id, name, displayName, photos } = profile;

            let _user = await this.database.getUserById(id);
            if (!_user) {
                const newUser = await this.database.addGoogleUser({ firstName: name?.givenName ? name.givenName : "First", lastName: name?.familyName ? name.familyName : "last", username: displayName, id, profilePhoto: photos![0].value });
                return done(null, newUser);
            }

            _user.lastVisited = new Date();
            return done(null, _user);
        }));

        // Used to stuff a piece of information into a cookie
        passport.serializeUser((user: any, done) => {
            done(null, user.id);
        });

        // Used to decode the received cookie and persist session
        passport.deserializeUser(async (id: any, done) => {
            const currentUser = await this.database.getUserById(id);
            done(null, currentUser);
        });

    }

    run(): Router {
        this.router.get("/", (req, res): any => {
            return res.send({ message: "Hello world" });
        });

        this.loadApiRoutes();

        return this.router;
    }

    isUserAuthenticated(req: Request, res: Response, next: NextFunction) {
        if (req.user) {
            next();
        } else {
            res.send('You must login!');
        }
    }

    // create a dynamic length id generator
    _generateId(length: number) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }


    loadApiRoutes() {
        const mainRoutes = fs.readdirSync(__dirname + "/Api", { withFileTypes: true }).filter(file => file.isDirectory() && file.name !== "Base");
        for (let mainRoute of mainRoutes) {
            const routes = fs.readdirSync(__dirname + "/Api/" + mainRoute.name, { withFileTypes: true });

            for (let route of routes) {
                if(route.isDirectory()) continue;
                let routeClass = require(`./Api/${mainRoute.name}/${route.name}`).default;
                routeClass = new routeClass(this.database);

                if (routeClass.route === "/google/callback") this.router[routeClass.method as Methods](`/${mainRoute.name}${routeClass.route}`, passport.authenticate('google'), (...d) => routeClass.run.bind(this)(...d));
                else if (routeClass.route === "/google") this.router[routeClass.method as Methods](`/${mainRoute.name}${routeClass.route}`, passport.authenticate('google', { scope: ["profile"] }), (...d) => routeClass.run.bind(this)(...d));
                else this.router[routeClass.method as Methods](`/${mainRoute.name}${routeClass.route}`, (...d) => routeClass.run.bind(this)(...d));
                Logger.log(`Loaded [${routeClass.method.toUpperCase()}] /api/${mainRoute.name}${routeClass.route}`, "debug");
            }
        }
    }
}