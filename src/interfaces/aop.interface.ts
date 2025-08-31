import type { AOPOptions } from './aop-decorator.interface';

/**
 * AOP decorator types
 * @property `AROUND` - Around decorator
 * @property `BEFORE` - Before decorator
 * @property `AFTER` - After decorator
 * @property `AFTER_RETURNING` - AfterReturning decorator
 * @property `AFTER_THROWING` - AfterThrowing decorator
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
 * AOP method type
 * @template T - Method return type
 */
export type AOPMethod<T = unknown> = (...args: any[]) => T;

/**
 * AOP context type
 *
 * @template O - Options type
 * @template T - Method return type
 * @template E - Error type
 */
export type AOPContext<O = AOPOptions, T = unknown, E = unknown> = {
  /** Original method function */
  method: Function;
  /** Decorator options */
  options: O;
  /** Method execution result (afterReturning only) */
  result?: T;
  /** Error thrown (afterThrowing only) */
  error?: E;
};

/**
 * AOP context type which includes method and options only
 * @template O - Options type
 */
export type UnitAOPContext<O = AOPOptions> = Pick<AOPContext<O>, 'method' | 'options'>;

/**
 * AOP context type which includes method, options and result
 * @template O - Options type
 * @template T - Method return type
 */
export type ResultAOPContext<O = AOPOptions, T = any> = Pick<
  AOPContext<O, T>,
  'method' | 'options' | 'result'
>;

/**
 * AOP context type which includes method, options and error
 * @template O - Options type
 * @template E - Error type
 */
export type ErrorAOPContext<O = AOPOptions, E = unknown> = Pick<
  AOPContext<O, unknown, E>,
  'method' | 'options' | 'error'
>;
