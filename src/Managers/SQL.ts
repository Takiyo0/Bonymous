import SQLite from "./SQLs/SQLite";
import PostgreSQL from "./SQLs/PostgreSQL";

import { File } from "../Modules/Constants";

export default class SQLManager {
    private client: SQLite | PostgreSQL;

    constructor(type: "SQLite" | "PostgreSQL") {
        this.client = type === "SQLite" ? new SQLite() : new PostgreSQL();
    }

    public async addUpload(file: File): Promise<{ fieldname: string; originalname: string; encoding: string; mimetype: string; size: number; destination: string; filename: string; path: string; id: string; }> {
        return this.client.addUpload(file);
    }

    public async getUploadById(id: string): Promise<any[]> {
        return this.client.getUploadById(id);
    }

    public async deleteUploadById(id: string): Promise<string> {
        return this.client.deleteUploadById(id);
    }

    public async getUploads(): Promise<any[]> {
        return this.client.getUploads();
    }
}