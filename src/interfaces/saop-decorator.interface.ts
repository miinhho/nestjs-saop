/**
 * SAOP decorator interfaces and types
 */

/**
 * AOP decorator types
 */
export const AOP_TYPES = {
  AROUND: 'around',
  BEFORE: 'before',
  AFTER: 'after',
  AFTER_RETURNING: 'afterReturning',
  AFTER_THROWING: 'afterThrowing',
} as const;

/**
 * AOP decorator type
 */
export type AOPType = (typeof AOP_TYPES)[keyof typeof AOP_TYPES];

/**
 * SAOP metadata key
 */
export const SAOP_METADATA_KEY = 'saop:decorators';

/**
 * AOP method type
 * @template T - Method return type
 */
export type AOPMethod<T = unknown> = (...args: any[]) => T;

/**
 * AOP context type
 * @template T - Method return type
 * @template E - Error type
 */
export type AOPContext<T = unknown, E = unknown> = {
  /** Original method function */
  method: Function;
  /** Decorator options */
  options: SAOPOptions;
  /** Method execution result (afterReturning only) */
  result?: T;
  /** Error thrown (afterThrowing only) */
  error?: E;
};

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
  around?(context: Pick<AOPContext<T, E>, 'method' | 'options'>): AOPMethod<T>;

  /**
   * Before decorator
   * @param context - Method and options context
   * @returns Callback function
   */
  before?(context: Pick<AOPContext<T, E>, 'method' | 'options'>): AOPMethod<void>;

  /**
   * After decorator
   * @param context - Method and options context
   * @returns Callback function
   */
  after?(context: Pick<AOPContext<T, E>, 'method' | 'options'>): AOPMethod<void>;

  /**
   * AfterReturning decorator
   * @param context - Method, options, and result context
   * @returns Callback function
   */
  afterReturning?(
    context: Pick<AOPContext<T, E>, 'method' | 'options' | 'result'>,
  ): AOPMethod<void>;

  /**
   * AfterThrowing decorator
   * @param context - Method, options, and error context
   * @returns Callback function
   */
  afterThrowing?(context: Pick<AOPContext<T, E>, 'method' | 'options' | 'error'>): AOPMethod<void>;
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
