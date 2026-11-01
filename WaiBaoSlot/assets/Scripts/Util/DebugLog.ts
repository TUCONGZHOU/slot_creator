import { native, sys } from 'cc';

export class DebugLog {
    private static _filePath: string = '';
    private static _firstWrite = true;

    private static getPath(): string {
        if (!this._filePath) {
            if (sys.platform === sys.Platform.ANDROID || sys.platform === sys.Platform.IOS) {
                this._filePath = native.fileUtils.getWritablePath() + 'game_debug.log';
            } else {
                this._filePath = 'game_debug.log';
            }
        }
        return this._filePath;
    }

    public static log(tag: string, msg: string): void {
        const time = new Date().toLocaleTimeString();
        const line = `[${time}] [${tag}] ${msg}\n`;
        console.log(line);
        try {
            const fs = native.fileUtils;
            const path = this.getPath();
            let existing = '';
            if (!this._firstWrite) {
                existing = fs.getStringFromFile(path) || '';
            }
            fs.writeStringToFile(existing + line, path);
            this._firstWrite = false;
        } catch (e) {
            // ignore
        }
    }

    public static clear(): void {
        this._firstWrite = true;
        try {
            native.fileUtils.writeStringToFile('', this.getPath());
        } catch (e) { }
    }
}
