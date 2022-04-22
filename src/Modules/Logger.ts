export default class Logger {
    public static log(message: string, type: string = "info") {
        console.log('\x1b[0m%s\x1b[36m%s\x1b[0m%s\x1b[32m\x1b[90m%s\x1b[0m%s', '[', `${type.toUpperCase()}`, '] ', `${new Date().toTimeString().substring(0, 8)} `, `${message}`);
    }

    public static error(message: string) {
        this.log(message, "error");
    }

    public static debug(message: string) {
        this.log(message, "debug");
    }
}