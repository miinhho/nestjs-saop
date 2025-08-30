import { Test, TestingModule } from '@nestjs/testing';
import { SAOPDecorator } from '../src/decorators/saop-decorator-classes';
import { AOP_TYPES, SAOP_METADATA_KEY } from '../src/interfaces';
import { SAOPModule } from '../src/saop.module';

describe('SAOPDecorator Base Class', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [SAOPModule.forRoot()],
    }).compile();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('SAOPDecorator static methods', () => {
    class ConcreteDecorator extends SAOPDecorator {}

    it('should have around static method', () => {
      expect(typeof ConcreteDecorator.around).toBe('function');
    });

    it('should have before static method', () => {
      expect(typeof ConcreteDecorator.before).toBe('function');
    });

    it('should have after static method', () => {
      expect(typeof ConcreteDecorator.after).toBe('function');
    });

    it('should have afterReturning static method', () => {
      expect(typeof ConcreteDecorator.afterReturning).toBe('function');
    });

    it('should have afterThrowing static method', () => {
      expect(typeof ConcreteDecorator.afterThrowing).toBe('function');
    });

    it('should create decorator function with around method', () => {
      const decorator = ConcreteDecorator.around({ level: 'info' });
      expect(typeof decorator).toBe('function');
      expect(decorator.length).toBe(3); // target, propertyKey, descriptor
    });

    it('should create decorator function with before method', () => {
      const decorator = ConcreteDecorator.before({ level: 'info' });
      expect(typeof decorator).toBe('function');
      expect(decorator.length).toBe(3);
    });

    it('should create decorator function with after method', () => {
      const decorator = ConcreteDecorator.after({ level: 'info' });
      expect(typeof decorator).toBe('function');
      expect(decorator.length).toBe(3);
    });

    it('should create decorator function with afterReturning method', () => {
      const decorator = ConcreteDecorator.afterReturning({ level: 'info' });
      expect(typeof decorator).toBe('function');
      expect(decorator.length).toBe(3);
    });

    it('should create decorator function with afterThrowing method', () => {
      const decorator = ConcreteDecorator.afterThrowing({ level: 'info' });
      expect(typeof decorator).toBe('function');
      expect(decorator.length).toBe(3);
    });

    it('should create decorator function with empty options', () => {
      const decorator = ConcreteDecorator.around();
      expect(typeof decorator).toBe('function');
      expect(decorator.length).toBe(3);
    });
  });

  describe('SAOPDecorator metadata application', () => {
    class ConcreteDecorator extends SAOPDecorator {}

    it('should apply around decorator and set metadata correctly', () => {
      const decorator = ConcreteDecorator.around({ level: 'info' });

      class TestClass {
        @decorator
        testMethod() {
          return 'test';
        }
      }

      const metadata = Reflect.getMetadata(SAOP_METADATA_KEY, TestClass, 'testMethod');
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBe(1);
      expect(metadata[0]).toEqual({
        type: AOP_TYPES.AROUND,
        options: { level: 'info' },
        decoratorClass: 'SAOPDecorator',
      });
    });

    it('should apply before decorator and set metadata correctly', () => {
      const decorator = ConcreteDecorator.before({ level: 'info' });

      class TestClass {
        @decorator
        testMethod() {
          return 'test';
        }
      }

      const metadata = Reflect.getMetadata(SAOP_METADATA_KEY, TestClass, 'testMethod');
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBe(1);
      expect(metadata[0]).toEqual({
        type: AOP_TYPES.BEFORE,
        options: { level: 'info' },
        decoratorClass: 'SAOPDecorator',
      });
    });

    it('should apply after decorator and set metadata correctly', () => {
      const decorator = ConcreteDecorator.after({ level: 'info' });

      class TestClass {
        @decorator
        testMethod() {
          return 'test';
        }
      }

      const metadata = Reflect.getMetadata(SAOP_METADATA_KEY, TestClass, 'testMethod');
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBe(1);
      expect(metadata[0]).toEqual({
        type: AOP_TYPES.AFTER,
        options: { level: 'info' },
        decoratorClass: 'SAOPDecorator',
      });
    });

    it('should apply afterReturning decorator and set metadata correctly', () => {
      const decorator = ConcreteDecorator.afterReturning({ level: 'info' });

      class TestClass {
        @decorator
        testMethod() {
          return 'test';
        }
      }

      const metadata = Reflect.getMetadata(SAOP_METADATA_KEY, TestClass, 'testMethod');
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBe(1);
      expect(metadata[0]).toEqual({
        type: AOP_TYPES.AFTER_RETURNING,
        options: { level: 'info' },
        decoratorClass: 'SAOPDecorator',
      });
    });

    it('should apply afterThrowing decorator and set metadata correctly', () => {
      const decorator = ConcreteDecorator.afterThrowing({ level: 'info' });

      class TestClass {
        @decorator
        testMethod() {
          return 'test';
        }
      }

      const metadata = Reflect.getMetadata(SAOP_METADATA_KEY, TestClass, 'testMethod');
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBe(1);
      expect(metadata[0]).toEqual({
        type: AOP_TYPES.AFTER_THROWING,
        options: { level: 'info' },
        decoratorClass: 'SAOPDecorator',
      });
    });
  });

  describe('Multiple decorators on same method', () => {
    class ConcreteDecorator extends SAOPDecorator {}

    it('should handle multiple decorators on same method', () => {
      const decorator1 = ConcreteDecorator.around({ level: 'info' });
      const decorator2 = ConcreteDecorator.before({ level: 'debug' });

      class TestClass {
        @decorator1
        @decorator2
        testMethod() {
          return 'test';
        }
      }

      const metadata = Reflect.getMetadata(SAOP_METADATA_KEY, TestClass, 'testMethod');
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBe(2);
      expect(metadata[0]).toEqual({
        type: AOP_TYPES.BEFORE,
        options: { level: 'debug' },
        decoratorClass: 'SAOPDecorator',
      });
      expect(metadata[1]).toEqual({
        type: AOP_TYPES.AROUND,
        options: { level: 'info' },
        decoratorClass: 'SAOPDecorator',
      });
    });
  });

  describe('SAOPDecorator interface compliance', () => {
    it('should have optional around method', () => {
      const decorator = new (class extends SAOPDecorator {})();
      expect(typeof decorator.around).toBe('undefined'); // optional method
    });

    it('should have optional before method', () => {
      const decorator = new (class extends SAOPDecorator {})();
      expect(typeof decorator.before).toBe('undefined'); // optional method
    });

    it('should have optional after method', () => {
      const decorator = new (class extends SAOPDecorator {})();
      expect(typeof decorator.after).toBe('undefined'); // optional method
    });

    it('should have optional afterReturning method', () => {
      const decorator = new (class extends SAOPDecorator {})();
      expect(typeof decorator.afterReturning).toBe('undefined'); // optional method
    });

    it('should have optional afterThrowing method', () => {
      const decorator = new (class extends SAOPDecorator {})();
      expect(typeof decorator.afterThrowing).toBe('undefined'); // optional method
    });
  });

  describe('Custom SAOPDecorator implementation', () => {
    class TestDecorator extends SAOPDecorator {
      around(context: any) {
        return (...args: any[]) => {
          return context.method.apply(this, args);
        };
      }

      before(context: any) {
        return (...args: any[]) => {
          console.log('Before method');
        };
      }
    }

    it('should allow custom implementation of around method', () => {
      const decorator = new TestDecorator();
      expect(typeof decorator.around).toBe('function');
    });

    it('should allow custom implementation of before method', () => {
      const decorator = new TestDecorator();
      expect(typeof decorator.before).toBe('function');
    });

    it('should have static methods on custom decorator', () => {
      expect(typeof TestDecorator.around).toBe('function');
      expect(typeof TestDecorator.before).toBe('function');
      expect(typeof TestDecorator.after).toBe('function');
      expect(typeof TestDecorator.afterReturning).toBe('function');
      expect(typeof TestDecorator.afterThrowing).toBe('function');
    });

    it('should create decorator function from custom class', () => {
      const decorator = TestDecorator.around({ customOption: 'test' });
      expect(typeof decorator).toBe('function');
      expect(decorator.length).toBe(3);
    });
  });

  describe('SAOPDecorator optional methods implementation', () => {
    it('should allow around method to be called', () => {
      const decorator = new (class extends SAOPDecorator {
        around(context: any) {
          return (...args: any[]) => `around: ${context.method.name}`;
        }
      })();

      const mockContext = { method: { name: 'testMethod' }, options: {} };
      const result = decorator.around!(mockContext);
      expect(typeof result).toBe('function');
      expect(result()).toBe('around: testMethod');
    });

    it('should allow before method to be called', () => {
      const decorator = new (class extends SAOPDecorator {
        before(context: any) {
          return (...args: any[]) => {
            console.log(`before: ${context.method.name}`);
          };
        }
      })();

      const mockContext = { method: { name: 'testMethod' }, options: {} };
      const result = decorator.before!(mockContext);
      expect(typeof result).toBe('function');
      expect(() => result()).not.toThrow();
    });

    it('should allow after method to be called', () => {
      const decorator = new (class extends SAOPDecorator {
        after(context: any) {
          return (...args: any[]) => {
            console.log(`after: ${context.method.name}`);
          };
        }
      })();

      const mockContext = { method: { name: 'testMethod' }, options: {} };
      const result = decorator.after!(mockContext);
      expect(typeof result).toBe('function');
      expect(() => result()).not.toThrow();
    });

    it('should allow afterReturning method to be called', () => {
      const decorator = new (class extends SAOPDecorator {
        afterReturning(context: any) {
          return (...args: any[]) => {
            console.log(`afterReturning: ${context.method.name}, result: ${context.result}`);
          };
        }
      })();

      const mockContext = {
        method: { name: 'testMethod' },
        options: {},
        result: 'test result',
      };
      const result = decorator.afterReturning!(mockContext);
      expect(typeof result).toBe('function');
      expect(() => result()).not.toThrow();
    });

    it('should allow afterThrowing method to be called', () => {
      const decorator = new (class extends SAOPDecorator {
        afterThrowing(context: any) {
          return (...args: any[]) => {
            console.log(`afterThrowing: ${context.method.name}, error: ${context.error}`);
          };
        }
      })();

      const mockContext = {
        method: { name: 'testMethod' },
        options: {},
        error: new Error('test error'),
      };
      const result = decorator.afterThrowing!(mockContext);
      expect(typeof result).toBe('function');
      expect(() => result()).not.toThrow();
    });
  });
});
