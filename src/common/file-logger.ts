import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileLogger implements LoggerService {
    private logFile: string;

    constructor() {
        this.logFile = path.resolve(process.cwd(), 'debug_holidays.log');
    }

    log(message: any, ...optionalParams: any[]) {
        this.writeToFile('LOG', message, optionalParams);
    }

    error(message: any, ...optionalParams: any[]) {
        this.writeToFile('ERROR', message, optionalParams);
    }

    warn(message: any, ...optionalParams: any[]) {
        this.writeToFile('WARN', message, optionalParams);
    }

    debug(message: any, ...optionalParams: any[]) {
        this.writeToFile('DEBUG', message, optionalParams);
    }

    verbose(message: any, ...optionalParams: any[]) {
        this.writeToFile('VERBOSE', message, optionalParams);
    }

    private writeToFile(level: string, message: any, params: any[]) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message} ${JSON.stringify(params)}\n`;
        fs.appendFileSync(this.logFile, formattedMessage);
    }
}
