import { AOP_TYPES } from '../interfaces';
import { addMetadata, AOP_METADATA_KEY } from './add-metadata';

describe('addMetadata', () => {
  let mockTarget: any;
  let mockPropertyKey: string | symbol;
  let getMetadataSpy: jest.SpyInstance;
  let defineMetadataSpy: jest.SpyInstance;

  beforeEach(() => {
    mockTarget = { constructor: jest.fn() };
    mockPropertyKey = 'testMethod';

    getMetadataSpy = jest.spyOn(Reflect, 'getMetadata');
    defineMetadataSpy = jest.spyOn(Reflect, 'defineMetadata');
  });

  it('should add metadata for the first time when no existing metadata', () => {
    class TestDecorator {}
    getMetadataSpy.mockReturnValue(undefined);

    addMetadata({
      decoratorClass: TestDecorator,
      target: mockTarget,
      propertyKey: mockPropertyKey,
      options: { priority: 1 },
      type: AOP_TYPES.BEFORE,
    });

    expect(getMetadataSpy).toHaveBeenCalledWith(
      AOP_METADATA_KEY,
      mockTarget.constructor,
      mockPropertyKey,
    );
    expect(defineMetadataSpy).toHaveBeenCalledWith(
      AOP_METADATA_KEY,
      [{ type: AOP_TYPES.BEFORE, options: { priority: 1 }, decoratorClass: TestDecorator }],
      mockTarget.constructor,
      mockPropertyKey,
    );
  });

  it('should append to existing metadata array', () => {
    class NewDecorator {}
    class ExistingDecorator {}
    const existingDecorators = [
      { type: AOP_TYPES.AFTER, options: {}, decoratorClass: ExistingDecorator },
    ];
    getMetadataSpy.mockReturnValue(existingDecorators);

    addMetadata({
      decoratorClass: NewDecorator,
      target: mockTarget,
      propertyKey: mockPropertyKey,
      options: {},
      type: AOP_TYPES.BEFORE,
    });

    expect(defineMetadataSpy).toHaveBeenCalledWith(
      AOP_METADATA_KEY,
      [
        { type: AOP_TYPES.AFTER, options: {}, decoratorClass: ExistingDecorator },
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: NewDecorator },
      ],
      mockTarget.constructor,
      mockPropertyKey,
    );
  });

  it('should handle multiple calls and accumulate metadata', () => {
    class FirstDecorator {}
    class SecondDecorator {}
    getMetadataSpy.mockReturnValueOnce(undefined);
    getMetadataSpy.mockReturnValueOnce([
      { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: FirstDecorator },
    ]);

    addMetadata({
      decoratorClass: FirstDecorator,
      target: mockTarget,
      propertyKey: mockPropertyKey,
      options: {},
      type: AOP_TYPES.BEFORE,
    });

    addMetadata({
      decoratorClass: SecondDecorator,
      target: mockTarget,
      propertyKey: mockPropertyKey,
      options: { priority: 2 },
      type: AOP_TYPES.AFTER,
    });

    expect(defineMetadataSpy).toHaveBeenLastCalledWith(
      AOP_METADATA_KEY,
      [
        { type: AOP_TYPES.BEFORE, options: {}, decoratorClass: FirstDecorator },
        { type: AOP_TYPES.AFTER, options: { priority: 2 }, decoratorClass: SecondDecorator },
      ],
      mockTarget.constructor,
      mockPropertyKey,
    );
  });

  it('should correctly store all provided fields', () => {
    class CompleteDecorator {}
    getMetadataSpy.mockReturnValue(undefined);

    addMetadata({
      decoratorClass: CompleteDecorator,
      target: mockTarget,
      propertyKey: mockPropertyKey,
      options: { customOption: 'value' },
      type: AOP_TYPES.AROUND,
    });

    expect(defineMetadataSpy).toHaveBeenCalledWith(
      AOP_METADATA_KEY,
      [
        {
          type: AOP_TYPES.AROUND,
          options: { customOption: 'value' },
          decoratorClass: CompleteDecorator,
        },
      ],
      mockTarget.constructor,
      mockPropertyKey,
    );
  });
});
