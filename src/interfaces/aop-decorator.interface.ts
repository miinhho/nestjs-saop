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
 * AOP decorator metadata
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
 * AOP options
 */
export interface AOPOptions {
  /** Any option key-value pairs */
  [key: string]: any;
}
