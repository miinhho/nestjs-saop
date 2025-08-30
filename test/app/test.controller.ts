import { Controller, Get } from '@nestjs/common';
import { LoggingDecorator } from './logging.decorator';
import { TestService } from './test.service';

@Controller()
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('test')
  @LoggingDecorator.around({ level: 'info' })
  getTest(): string {
    return this.testService.getTestMessage();
  }

  @Get('before')
  @LoggingDecorator.before({ level: 'info' })
  getBefore(): string {
    return this.testService.getBeforeMessage();
  }

  @Get('after')
  @LoggingDecorator.after({ level: 'info' })
  getAfter(): string {
    return this.testService.getAfterMessage();
  }

  @Get('after-returning')
  @LoggingDecorator.afterReturning({ level: 'info' })
  getAfterReturning(): string {
    return this.testService.getAfterReturningMessage();
  }

  @Get('after-throwing')
  @LoggingDecorator.afterThrowing({ level: 'info' })
  getAfterThrowing(): string {
    return this.testService.getAfterThrowingMessage();
  }
}
