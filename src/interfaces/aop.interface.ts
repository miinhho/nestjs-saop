import type { AOPOptions } from './aop-decorator.interface';

/**
 * The available types of AOP decorators that can be applied to methods.
 *
 * Each type corresponds to a different pointcut in the method execution lifecycle.
 *
 * @property `AROUND`
 * @property `BEFORE`
 * @property `AFTER`
 * @property `AFTER_RETURNING`
 * @property `AFTER_THROWING`
 *
 * @internal
 */
export const AOP_TYPES = {
  AROUND: 'saop:around',
  BEFORE: 'saop:before',
  AFTER: 'saop:after',
  AFTER_RETURNING: 'saop:afterReturning',
  AFTER_THROWING: 'saop:afterThrowing',
} as const;

/**
 * All possible AOP decorator types.
 * @internal
 */
export type AOPType = (typeof AOP_TYPES)[keyof typeof AOP_TYPES];

/**
 * A method function that can be used in AOP contexts.
 */
export type AOPMethod<ReturnType = any> = (...args: any[]) => ReturnType;

/**
 * Context object passed to AOP decorators.
 *
 * Containing all information needed for method interception and advice execution.
 *
 * @property `method` - The original method function being intercepted
 * @property `options` - Configuration options passed to the decorator
 * @property `result` - The result returned by the method (available in afterReturning)
 * @property `error` - The error thrown by the method (available in afterThrowing)
 *
 * @internal
 */
export type AOPContext<Options extends AOPOptions, ReturnType = any, ErrorType = unknown> = {
  /** The original method function being intercepted */
  method: Function;
  /** Configuration options passed to the decorator */
  options: Options;
  /** The result returned by the method (available in afterReturning) */
  result?: ReturnType;
  /** The error thrown by the method (available in afterThrowing) */
  error?: ErrorType;
};

/**
 * Simplified context used for AOP advice that doesn't need access to
 * method results or errors.
 *
 * (`before`, `after`, `around` advice)
 */
export type UnitAOPContext<Options extends AOPOptions = AOPOptions> = Pick<
  AOPContext<Options>,
  'method' | 'options'
>;

/**
 * Context used for `after-returning` advice, providing access to the
 * method's return value along with the standard context information.
 */
export type ResultAOPContext<Options extends AOPOptions = AOPOptions, ReturnType = any> = Pick<
  AOPContext<Options, ReturnType>,
  'method' | 'options' | 'result'
>;

/**
 * Context used for `after-throwing` advice, providing access to the
 * exception thrown by the method along with the standard context information.
 */
export type ErrorAOPContext<Options extends AOPOptions = AOPOptions, ErrorType = unknown> = Pick<
  AOPContext<Options, unknown, ErrorType>,
  'method' | 'options' | 'error'
>;
