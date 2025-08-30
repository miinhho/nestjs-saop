import { Module } from '@nestjs/common';
import { SAOPModule } from 'nestjs-saop';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingAOP } from './logging.aop';

@Module({
  imports: [SAOPModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, LoggingAOP],
})
export class AppModule {}
