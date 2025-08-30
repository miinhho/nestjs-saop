import { Test, TestingModule } from '@nestjs/testing';
import { SAOPModule } from '../src/saop.module';
import { TestService } from './app/test.service';

describe('AOP Integration', () => {
  let module: TestingModule;
  let testService: TestService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SAOPModule.forRoot()],
      providers: [TestService],
    }).compile();

    testService = module.get(TestService);
  });

  it('should have TestService methods', () => {
    expect(typeof testService.getTestMessage).toBe('function');
    expect(typeof testService.getBeforeMessage).toBe('function');
    expect(typeof testService.getAfterMessage).toBe('function');
    expect(typeof testService.getAfterReturningMessage).toBe('function');
    expect(typeof testService.getAfterThrowingMessage).toBe('function');
  });

  it('should execute getTestMessage without AOP decorators', () => {
    // Test basic functionality without AOP decorators
    const result = testService.getTestMessage();
    expect(result).toBe('Test endpoint with AOP');
    expect(typeof testService.getTestMessage).toBe('function');
  });

  it('should execute getBeforeMessage without AOP decorators', () => {
    const result = testService.getBeforeMessage();
    expect(result).toBe('Before message');
    expect(typeof testService.getBeforeMessage).toBe('function');
  });

  it('should execute getAfterMessage without AOP decorators', () => {
    const result = testService.getAfterMessage();
    expect(result).toBe('After message');
    expect(typeof testService.getAfterMessage).toBe('function');
  });

  it('should execute getAfterReturningMessage without AOP decorators', () => {
    const result = testService.getAfterReturningMessage();
    expect(result).toBe('After returning message');
    expect(typeof testService.getAfterReturningMessage).toBe('function');
  });

  it('should execute getAfterThrowingMessage without AOP decorators', () => {
    expect(() => {
      testService.getAfterThrowingMessage();
    }).toThrow('Test error');
    expect(typeof testService.getAfterThrowingMessage).toBe('function');
  });
});
