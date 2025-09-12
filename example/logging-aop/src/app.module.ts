import { Module } from '@nestjs/common';
import { AOPModule } from 'nestjs-saop';
import { PrimaryLoggingAOP } from 'src/primary-logging.aop';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingAOP } from './logging.aop';

@Module({
  imports: [AOPModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, LoggingAOP, PrimaryLoggingAOP],
})
export class AppModule {}
