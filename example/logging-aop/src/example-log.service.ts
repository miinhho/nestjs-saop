import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleLogService {
  getLog(message: string): string {
    return `Log: ${message}`;
  }
}
