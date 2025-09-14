import { Module } from '@nestjs/common';
import { AOPModule } from 'nestjs-saop';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleLogService } from './example-log.service';
import { LoggingAOP } from './logging.aop';
import { PrimaryLoggingAOP } from './primary-logging.aop';

@Module({
  imports: [AOPModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, LoggingAOP, PrimaryLoggingAOP, ExampleLogService],
})
export class AppModule {}
