import { AOP_TYPES } from '../interfaces';
import { AOP_METADATA_KEY } from '../utils';
import { AOPDecorator } from './aop-decorator-classes';

class TestAOPDecorator extends AOPDecorator {}

describe('AOPDecorator', () => {
  let mockTarget: any;
  let mockPropertyKey: string | symbol;
  let mockDescriptor: PropertyDescriptor;
  let getMetadataSpy: jest.SpyInstance;
  let defineMetadataSpy: jest.SpyInstance;

  beforeEach(() => {
    mockTarget = { constructor: jest.fn() };
    mockPropertyKey = 'testMethod';
    mockDescriptor = {};
    getMetadataSpy = jest.spyOn(Reflect, 'getMetadata');
    defineMetadataSpy = jest.spyOn(Reflect, 'defineMetadata');
    getMetadataSpy.mockReturnValue(undefined);
  });

  describe('around', () => {
    it('should create a method decorator that calls addMetadata with correct parameters', () => {
      const decorator = TestAOPDecorator.around({ priority: 1 });

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AROUND, options: { priority: 1 }, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should use default options when none provided', () => {
      const decorator = TestAOPDecorator.around();

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AROUND, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should handle symbol propertyKey', () => {
      const symbolKey = Symbol('test');
      const decorator = TestAOPDecorator.around();

      decorator(mockTarget, symbolKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AROUND, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        symbolKey,
      );
    });

    it('should throw TypeError when target is null', () => {
      const decorator = TestAOPDecorator.around();

      expect(() => {
        decorator(null as any, mockPropertyKey, mockDescriptor);
      }).toThrow(TypeError);
    });

    it('should throw TypeError when target is undefined', () => {
      const decorator = TestAOPDecorator.around();

      expect(() => {
        decorator(undefined as any, mockPropertyKey, mockDescriptor);
      }).toThrow(TypeError);
    });
  });

  describe('before', () => {
    it('should create a method decorator that calls addMetadata with correct parameters', () => {
      const decorator = TestAOPDecorator.before({ priority: 1 });

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.BEFORE, options: { priority: 1 }, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should use default options when none provided', () => {
      const decorator = TestAOPDecorator.before();

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should handle symbol propertyKey', () => {
      const symbolKey = Symbol('test');
      const decorator = TestAOPDecorator.before();

      decorator(mockTarget, symbolKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        symbolKey,
      );
    });

    it('should throw TypeError when target is null', () => {
      const decorator = TestAOPDecorator.before();

      expect(() => {
        decorator(null as any, mockPropertyKey, mockDescriptor);
      }).toThrow(TypeError);
    });
  });

  describe('after', () => {
    it('should create a method decorator that calls addMetadata with correct parameters', () => {
      const decorator = TestAOPDecorator.after({ priority: 1 });

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AFTER, options: { priority: 1 }, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should use default options when none provided', () => {
      const decorator = TestAOPDecorator.after();

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AFTER, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should handle symbol propertyKey', () => {
      const symbolKey = Symbol('test');
      const decorator = TestAOPDecorator.after();

      decorator(mockTarget, symbolKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AFTER, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        symbolKey,
      );
    });

    it('should throw TypeError when target is null', () => {
      const decorator = TestAOPDecorator.after();

      expect(() => {
        decorator(null as any, mockPropertyKey, mockDescriptor);
      }).toThrow(TypeError);
    });
  });

  describe('afterReturning', () => {
    it('should create a method decorator that calls addMetadata with correct parameters', () => {
      const decorator = TestAOPDecorator.afterReturning({ priority: 1 });

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [
          {
            type: AOP_TYPES.AFTER_RETURNING,
            options: { priority: 1 },
            decoratorClass: TestAOPDecorator,
          },
        ],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should use default options when none provided', () => {
      const decorator = TestAOPDecorator.afterReturning();

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AFTER_RETURNING, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should handle symbol propertyKey', () => {
      const symbolKey = Symbol('test');
      const decorator = TestAOPDecorator.afterReturning();

      decorator(mockTarget, symbolKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AFTER_RETURNING, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        symbolKey,
      );
    });

    it('should throw TypeError when target is null', () => {
      const decorator = TestAOPDecorator.afterReturning();

      expect(() => {
        decorator(null as any, mockPropertyKey, mockDescriptor);
      }).toThrow(TypeError);
    });
  });

  describe('afterThrowing', () => {
    it('should create a method decorator that calls addMetadata with correct parameters', () => {
      const decorator = TestAOPDecorator.afterThrowing({ priority: 1 });

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [
          {
            type: AOP_TYPES.AFTER_THROWING,
            options: { priority: 1 },
            decoratorClass: TestAOPDecorator,
          },
        ],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should use default options when none provided', () => {
      const decorator = TestAOPDecorator.afterThrowing();

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AFTER_THROWING, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should handle symbol propertyKey', () => {
      const symbolKey = Symbol('test');
      const decorator = TestAOPDecorator.afterThrowing();

      decorator(mockTarget, symbolKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AFTER_THROWING, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        symbolKey,
      );
    });

    it('should throw TypeError when target is null', () => {
      const decorator = TestAOPDecorator.afterThrowing();

      expect(() => {
        decorator(null as any, mockPropertyKey, mockDescriptor);
      }).toThrow(TypeError);
    });
  });

  describe('edge cases', () => {
    it('should handle empty options object', () => {
      const decorator = TestAOPDecorator.around({});

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AROUND, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });

    it('should handle propertyKey as empty string', () => {
      const decorator = TestAOPDecorator.before();

      decorator(mockTarget, '', mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.BEFORE, options: {}, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        '',
      );
    });
  });
});
