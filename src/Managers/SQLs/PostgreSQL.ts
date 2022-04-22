import postgres, { RowList, Row } from "postgres";
import { File } from "../../Modules/Constants";

import { PostgreSQLConfig } from "../../../config";

export default class PostgreSQL {
    private client: postgres.Sql<{}>;

    constructor() {
        this.client = postgres(PostgreSQLConfig);

        this.prepareTable();
    }

    private async prepareTable(): Promise<void> {
        this.getUploads().catch(async () => {
            await this.client`CREATE TABLE IF NOT EXISTS uploads (
            id TEXT PRIMARY KEY,
            originalname TEXT,
            mimetype TEXT,
            filename TEXT,
            size INTEGER,
            destination TEXT,
            fieldname TEXT
        )`;
        });
    }

    public async addUpload(file: File): Promise<{ fieldname: string; originalname: string; encoding: string; mimetype: string; size: number; destination: string; filename: string; path: string; id: string; }> {
        const id = this.generateId(15);

        await this.client`INSERT INTO uploads (id, originalname, mimetype, filename, size, destination, fieldname) VALUES (${id}, ${file.originalname}, ${file.mimetype}, ${file.filename}, ${file.size}, ${file.destination}, ${file.fieldname})`;

        return { id, ...file };
    }

    public async getUploadById(id: string): Promise<RowList<Row[]>> {
        const result = await this.client`SELECT * FROM uploads WHERE id = ${id}`;

        return result;
    }

    public async deleteUploadById(id: string): Promise<string> {
        await this.client`DELETE FROM uploads WHERE id = ${id}`;

        return id;
    }

    public async getUploads(): Promise<RowList<Row[]>> {
        const result = await this.client`SELECT * FROM uploads`;

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