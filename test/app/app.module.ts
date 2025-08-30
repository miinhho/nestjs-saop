import { Module } from '@nestjs/common';
import { SAOPModule } from '../../src/saop.module';
import { LoggingDecorator } from './logging.decorator';
import { TestController } from './test.controller';
import { TestService } from './test.service';

@Module({
  imports: [SAOPModule.forRoot()],
  controllers: [TestController],
  providers: [TestService, LoggingDecorator],
})
export class AppModule {}
