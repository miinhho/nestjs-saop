import type { AOPOptions } from './aop-decorator.interface';
import type { AOPMethod, ErrorAOPContext, ResultAOPContext, UnitAOPContext } from './aop.interface';

/**
 * Contract for around advice, which wraps the entire method execution.
 * Allows complete control over method invocation, including the ability to modify
 * parameters, skip execution, or alter the return value.
 *
 * @template O - Options type
 * @template T - Method return type (default: `any`)
 */
export interface AroundAOP<O extends AOPOptions = AOPOptions, T = any> {
  /**
   * Around decorator method
   *
   * See `AOPDecorator.around`
   * {@link file://./../decorators/aop-decorator-classes.ts} for details.
   */
  around(context: UnitAOPContext<O>): AOPMethod<T>;
}

/**
 * Contract for before advice, which executes before the target method.
 *
 * @template O - Options type
 */
export interface BeforeAOP<O extends AOPOptions = AOPOptions> {
  /**
   * Before decorator method
   *
   * See `AOPDecorator.before`
   * {@link file://./../decorators/aop-decorator-classes.ts} for details.
   */
  before(context: UnitAOPContext<O>): AOPMethod<void>;
}

/**
 * Contract for after advice, which executes after the target method,
 * regardless of whether it completed successfully or threw an exception.
 *
 * @template O - Options type
 */
export interface AfterAOP<O extends AOPOptions = AOPOptions> {
  /**
   * After decorator method
   *
   * See `AOPDecorator.after`
   * {@link file://./../decorators/aop-decorator-classes.ts} for details.
   */
  after(context: UnitAOPContext<O>): AOPMethod<void>;
}

/**
 * Contract for after-returning advice, which executes only when
 * the target method completes successfully without throwing an exception.
 *
 * Provides access to the method's return value.
 *
 * @template O - Options type
 * @template T - Method return type (default: `any`)
 */
export interface AfterReturningAOP<O extends AOPOptions = AOPOptions, T = any> {
  /**
   * AfterReturning decorator method
   *
   * See `AOPDecorator.afterReturning`
   * {@link file://./../decorators/aop-decorator-classes.ts} for details.
   */
  afterReturning(context: ResultAOPContext<O, T>): AOPMethod<void>;
}

/**
 * Contract for after-throwing advice, which executes only when
 * the target method throws an exception. Provides access to the thrown error.
 *
 * @template O - Options type
 * @template E - Error type (default: `unknown`)
 */
export interface AfterThrowingAOP<O extends AOPOptions = AOPOptions, E = unknown> {
  /**
   * AfterThrowing decorator method
   *
   * See `AOPDecorator.afterThrowing`
   * {@link file://./../decorators/aop-decorator-classes.ts} for details.
   */
  afterThrowing(context: ErrorAOPContext<O, E>): AOPMethod<void>;
}
