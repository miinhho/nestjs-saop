import {
  AOPMethod,
  AOPType,
  ErrorAOPContext,
  ResultAOPContext,
  UnitAOPContext,
} from './aop.interface';

/**
 * AOP metadata key
 */
export const AOP_METADATA_KEY = Symbol('saop:decorators');

/**
 * AOP class metadata key for @Aspect decorator
 */
export const AOP_CLASS_METADATA_KEY = Symbol('saop:class');

/**
 * SAOP decorator interface
 * @template O - Options type
 * @template T - Method return type
 * @template E - Error type
 */
export interface IAOPDecorator<O extends AOPOptions = AOPOptions, T = unknown, E = unknown> {
  /**
   * Around decorator
   * @param context - Method and options context
   * @returns Wrapped method function
   */
  around?(context: UnitAOPContext<O, T, E>): AOPMethod<T>;

  /**
   * Before decorator
   * @param context - Method and options context
   * @returns Callback function
   */
  before?(context: UnitAOPContext<O, T, E>): AOPMethod<void>;

  /**
   * After decorator
   * @param context - Method and options context
   * @returns Callback function
   */
  after?(context: UnitAOPContext<O, T, E>): AOPMethod<void>;

  /**
   * AfterReturning decorator
   * @param context - Method, options, and result context
   * @returns Callback function
   */
  afterReturning?(context: ResultAOPContext<O, T, E>): AOPMethod<void>;

  /**
   * AfterThrowing decorator
   * @param context - Method, options, and error context
   * @returns Callback function
   */
  afterThrowing?(context: ErrorAOPContext<O, T, E>): AOPMethod<void>;
}

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
