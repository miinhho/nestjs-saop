import { SAOPOptions } from './saop-decorator.interface';

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
