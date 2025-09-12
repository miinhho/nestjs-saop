import { AOP_TYPES } from '../interfaces';
import { AOP_METADATA_KEY } from '../utils';
import { AOPDecorator } from './aop-decorator-classes';

class TestAOPDecorator extends AOPDecorator {}

describe('AOPDecorator', () => {
  let mockTarget: any;
  let mockPropertyKey: string;
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
    it('should create a method decorator with options', () => {
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
  });

  describe('before', () => {
    it('should create a method decorator with options', () => {
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
  });

  describe('after', () => {
    it('should create a method decorator with options', () => {
      const decorator = TestAOPDecorator.after({ priority: 1 });

      decorator(mockTarget, mockPropertyKey, mockDescriptor);

      expect(defineMetadataSpy).toHaveBeenCalledWith(
        AOP_METADATA_KEY,
        [{ type: AOP_TYPES.AFTER, options: { priority: 1 }, decoratorClass: TestAOPDecorator }],
        mockTarget.constructor,
        mockPropertyKey,
      );
    });
  });

  describe('afterReturning', () => {
    it('should create a method decorator with correct type', () => {
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
  });

  describe('afterThrowing', () => {
    it('should create a method decorator with correct type', () => {
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
  });
});
