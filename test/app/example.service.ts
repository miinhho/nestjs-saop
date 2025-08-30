import { Injectable } from '@nestjs/common';
import { CachingDecorator } from './caching.decorator';
import { LoggingDecorator } from './logging.decorator';
import { PerformanceDecorator } from './performance.decorator';

@Injectable()
export class ExampleService {
  private users: any[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  @LoggingDecorator.create({ level: 'info', logArgs: true, logResult: true })
  async createUser(userData: { name: string; email: string }) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  @CachingDecorator.create({ ttl: 300000 }) // 5분 캐시
  async getUserById(id: number) {
    // 실제로는 DB 조회
    await new Promise(resolve => setTimeout(resolve, 100)); // 시뮬레이션
    return this.users.find(user => user.id === id);
  }

  @PerformanceDecorator.create({ logPerformance: true, threshold: 200 })
  async getAllUsers() {
    // 실제로는 DB 조회
    await new Promise(resolve => setTimeout(resolve, 50)); // 시뮬레이션
    return this.users;
  }

  @LoggingDecorator.create({ level: 'error', logStack: true })
  async riskyOperation() {
    // 에러가 발생할 수 있는 작업
    if (Math.random() > 0.7) {
      throw new Error('Something went wrong!');
    }
    return { success: true };
  }
}
