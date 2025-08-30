import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  getTestMessage(): string {
    return 'Test endpoint with AOP';
  }

  getBeforeMessage(): string {
    return 'Before message';
  }

  getAfterMessage(): string {
    return 'After message';
  }

  getAfterReturningMessage(): string {
    return 'After returning message';
  }

  getAfterThrowingMessage(): string {
    throw new Error('Test error');
  }
}
