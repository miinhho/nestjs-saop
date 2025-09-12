import type { AOPOptions } from './aop-decorator.interface';
import type {
  AOPMethod,
  AroundAOPContext,
  ErrorAOPContext,
  ResultAOPContext,
  UnitAOPContext,
} from './aop.interface';

/**
 * Contract for around advice, which wraps the entire method execution.
 *
 * Allows complete control over method invocation, including the ability to modify
 * parameters, skip execution, or alter the return value.
 */
export interface AroundAOP<Options extends AOPOptions = AOPOptions, ReturnType = any> {
  /**
   * Around decorator method
   *
   * See {@link AOPDecorator.around} for details.
   */
  around(context: AroundAOPContext<Options>): AOPMethod<ReturnType>;
}

/**
 * Contract for before advice, which executes before the target method.
 */
export interface BeforeAOP<Options extends AOPOptions = AOPOptions> {
  /**
   * Before decorator method
   *
   * See {@link AOPDecorator.before} for details.
   */
  before(context: UnitAOPContext<Options>): AOPMethod<void>;
}

/**
 * Contract for after advice, which executes after the target method,
 * regardless of whether it completed successfully or threw an exception.
 */
export interface AfterAOP<Options extends AOPOptions = AOPOptions> {
  /**
   * After decorator method
   *
   * See {@link AOPDecorator.after} for details.
   */
  after(context: UnitAOPContext<Options>): AOPMethod<void>;
}

/**
 * Contract for after-returning advice, which executes only when
 * the target method completes successfully without throwing an exception.
 *
 * Provides access to the method's return value.
 */
export interface AfterReturningAOP<Options extends AOPOptions = AOPOptions, ReturnType = any> {
  /**
   * AfterReturning decorator method
   *
   * See {@link AOPDecorator.afterReturning} for details.
   */
  afterReturning(context: ResultAOPContext<Options, ReturnType>): AOPMethod<void>;
}

/**
 * Contract for after-throwing advice, which executes only when
 * the target method throws an exception. Provides access to the thrown error.
 */
export interface AfterThrowingAOP<Options extends AOPOptions = AOPOptions, ErrorType = unknown> {
  /**
   * AfterThrowing decorator method
   *
   * See {@link AOPDecorator.afterThrowing} for details.
   */
  afterThrowing(context: ErrorAOPContext<Options, ErrorType>): AOPMethod<void>;
}
