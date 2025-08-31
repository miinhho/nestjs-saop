import type {
  AfterAOP,
  AfterReturningAOP,
  AfterThrowingAOP,
  AroundAOP,
  BeforeAOP,
} from './aop-execution.interface';
import type { AOPType } from './aop.interface';

/**
 * SAOP decorator interface
 * @template O - Options type
 * @template T - Method return type
 * @template E - Error type
 */
export interface IAOPDecorator<O extends AOPOptions = AOPOptions, T = any, E = unknown>
  extends Partial<AroundAOP<O, T>>,
    Partial<BeforeAOP<O>>,
    Partial<AfterAOP<O>>,
    Partial<AfterReturningAOP<O, T>>,
    Partial<AfterThrowingAOP<O, E>> {}

/**
 * AOP options
 */
export interface AOPOptions {
  /** Any option key-value pairs */
  [key: string]: any;
}

/**
 * AOP decorator metadata
 * @property `type` - Decorator type
 * @property `options` - Decorator options
 * @property `decoratorClass` - Decorator class name
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
 * AOP decorator application context
 * @property `aopDecorator` - AOP decorator instance
 * @property `descriptor` - Method property descriptor
 * @property `instance` - Target instance
 * @property `originalMethod` - Original method function
 * @property `options` - Decorator options
 */
export type AOPDecoratorContext = {
  aopDecorator: IAOPDecorator;
  descriptor: PropertyDescriptor;
  instance: any;
  originalMethod: Function;
  options: any;
};

/**
 * AOP method with decorators
 */
export interface AOPMethodWithDecorators {
  /** Method name */
  methodName: string;
  /** Array of decorator metadata */
  decorators: any[];
}
