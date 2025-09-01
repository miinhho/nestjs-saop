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
 *
 * @template T - The return type of the method (default: `any`)
 */
export type AOPMethod<T = any> = (...args: any[]) => T;

/**
 * Context object passed to AOP decorators.
 *
 * Containing all information needed for method interception and advice execution.
 *
 * @template O - Options type
 * @template T - Method return type (default: `any`)
 * @template E - Error type (default: `unknown`)
 *
 * @internal
 */
export type AOPContext<O = AOPOptions, T = any, E = unknown> = {
  /** The original method function being intercepted */
  method: Function;
  /** Configuration options passed to the decorator */
  options: O;
  /** The result returned by the method (available in afterReturning) */
  result?: T;
  /** The error thrown by the method (available in afterThrowing) */
  error?: E;
};

/**
 * Simplified context used for AOP advice that doesn't need access to
 * method results or errors.
 *
 * (`before`, `after`, `around` advice)
 *
 * @template O - Options type
 */
export type UnitAOPContext<O = AOPOptions> = Pick<AOPContext<O>, 'method' | 'options'>;

/**
 * Context used for `after-returning` advice, providing access to the
 * method's return value along with the standard context information.
 *
 * @template O - Options type
 * @template T - Method return type (default: `any`)
 */
export type ResultAOPContext<O = AOPOptions, T = any> = Pick<
  AOPContext<O, T>,
  'method' | 'options' | 'result'
>;

/**
 * Context used for `after-throwing` advice, providing access to the
 * exception thrown by the method along with the standard context information.
 *
 * @template O - Options type
 * @template E - Error type (default: `unknown`)
 */
export type ErrorAOPContext<O = AOPOptions, E = unknown> = Pick<
  AOPContext<O, unknown, E>,
  'method' | 'options' | 'error'
>;
