import {
  AOPMethod,
  AOPType,
  ErrorAOPContext,
  ResultAOPContext,
  UnitAOPContext,
} from './aop.interface';

/**
 * SAOP metadata key
 */
export const SAOP_METADATA_KEY = Symbol('saop:decorators');

/**
 * SAOP decorator interface
 * @template T - Method return type
 * @template E - Error type
 */
export interface ISAOPDecorator<T = unknown, E = unknown> {
  /**
   * Around decorator
   * @param context - Method and options context
   * @returns Wrapped method function
   */
  around?(context: UnitAOPContext<T, E>): AOPMethod<T>;

  /**
   * Before decorator
   * @param context - Method and options context
   * @returns Callback function
   */
  before?(context: UnitAOPContext<T, E>): AOPMethod<void>;

  /**
   * After decorator
   * @param context - Method and options context
   * @returns Callback function
   */
  after?(context: UnitAOPContext<T, E>): AOPMethod<void>;

  /**
   * AfterReturning decorator
   * @param context - Method, options, and result context
   * @returns Callback function
   */
  afterReturning?(context: ResultAOPContext<T, E>): AOPMethod<void>;

  /**
   * AfterThrowing decorator
   * @param context - Method, options, and error context
   * @returns Callback function
   */
  afterThrowing?(context: ErrorAOPContext<T, E>): AOPMethod<void>;
}

/**
 * SAOP decorator metadata
 */
export interface SAOPDecoratorMetadata {
  /** Decorator type */
  type: AOPType;
  /** Decorator options */
  options: SAOPOptions;
  /** Decorator class name (for class-based decorators) */
  decoratorClass?: string;
}

/**
 * SAOP options
 */
export interface SAOPOptions {
  /** Any option key-value pairs */
  [key: string]: any;
}
