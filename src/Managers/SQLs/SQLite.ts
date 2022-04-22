import sqlite, { RunResult } from "better-sqlite3";
import { File } from "../../Modules/Constants";

export default class SQLite {
    private client: sqlite.Database;

    constructor() {
        this.client = new sqlite("database.sqlite");

        this.client.prepare(`CREATE TABLE IF NOT EXISTS uploads (
            id TEXT PRIMARY KEY,
            originalname TEXT,
            mimetype TEXT,
            filename TEXT,
            size INTEGER,
            destination TEXT,
            fieldname TEXT
        )`).run();
    }

    // add upload using better-sqlite3
    public addUpload(file: File): { fieldname: string; originalname: string; encoding: string; mimetype: string; size: number; destination: string; filename: string; path: string; id: string; } {
        const id = this.generateId(15);

        this.client.prepare(`INSERT INTO uploads (id, originalname, mimetype, filename, size, destination, fieldname) VALUES ('${id}', '${file.originalname}', '${file.mimetype}', '${file.filename}', ${file.size}, '${file.destination}', '${file.fieldname}')`).run();

        return { id, ...file };
    }

    public getUploadById(id: string): any[] {
        const result = this.client.prepare(`SELECT * FROM uploads WHERE id = '${id}'`).all();

        return result;
    }

    public deleteUploadById(id: string): string {
        this.client.prepare(`DELETE FROM uploads WHERE id = '${id}'`).run();

        return id;
    }

    public getUploads(): any[] {
        const result = this.client.prepare(`SELECT * FROM uploads`).all();

        return result;
    }

    private generateId(length: number): string {
        const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let id = "";
        for (let i = 0; i < length; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }
}