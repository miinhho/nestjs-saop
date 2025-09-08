import type {
  AfterAOP,
  AfterReturningAOP,
  AfterThrowingAOP,
  AroundAOP,
  BeforeAOP,
} from './aop-execution.interface';
import type { AOPType } from './aop.interface';

/**
 * Base interface for all AOP decorators, providing optional implementations
 * for various AOP advice types (around, before, after, etc.).
 */
export interface IAOPDecorator<
  Options extends AOPOptions = AOPOptions,
  ReturnType = any,
  ErrorType = unknown,
> extends Partial<AroundAOP<Options, ReturnType>>,
    Partial<BeforeAOP<Options>>,
    Partial<AfterAOP<Options>>,
    Partial<AfterReturningAOP<Options, ReturnType>>,
    Partial<AfterThrowingAOP<Options, ErrorType>> {}

/**
 * Options passed to AOP decorators.
 *
 * Allows any key-value pairs.
 */
export interface AOPOptions {
  [key: string]: any;
}

/**
 * Information about an applied AOP decorator.
 *
 * @property `type` - The type of AOP decorator (e.g., around, before, after)
 * @property `options` - Configuration options passed to the decorator
 * @property `decoratorClass` - Optional name of the decorator class
 *
 * @internal
 */
export interface AOPDecoratorMetadata {
  /** Decorator type */
  type: AOPType;
  /** Decorator options */
  options: AOPOptions;
  /** Decorator class name */
  decoratorClass?: string;
}

/**
 * Context information when applying AOP decorators to methods.
 *
 * @property `aopDecorator` - The AOP decorator instance being applied
 * @property `descriptor` - The property descriptor of the target method
 * @property `instance` - The instance of the class containing the target method
 * @property `originalMethod` - The original method function before decoration
 * @property `options` - The options passed to the decorator
 *
 * @internal
 */
export type AOPDecoratorContext = {
  aopDecorator: IAOPDecorator;
  descriptor: PropertyDescriptor;
  instance: any;
  originalMethod: Function;
  options: any;
};

/**
 * Method that has AOP decorators applied to it,
 *
 * @property `methodName` - The name of the decorated method
 * @property `decorators` - Array of metadata for each applied decorator
 *
 * @internal
 */
export interface AOPMethodWithDecorators {
  /** Method name */
  methodName: string;
  /** Array of decorator metadata */
  decorators: any[];
}
