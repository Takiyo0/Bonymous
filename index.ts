import Server from "./src/Server";
import Logger from "./src/Modules/Logger";

declare module "express-session" {
    export interface SessionData {
        user: { [key: string]: any };
        data: { [key: string]: any };
        token: string;
    }
}

const server = new Server(4000);

server.start(() => {
    Logger.log("Server is listening on port 4000");
});