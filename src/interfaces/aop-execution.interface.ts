import type { AOPOptions } from './aop-decorator.interface';
import type { AOPMethod, ErrorAOPContext, ResultAOPContext, UnitAOPContext } from './aop.interface';

export interface AroundAOP<O extends AOPOptions = AOPOptions, T = any> {
  /**
   * Around decorator
   * @param context - Method and options context
   * @returns Wrapped method function
   */
  around(context: UnitAOPContext<O>): AOPMethod<T>;
}

export interface BeforeAOP<O extends AOPOptions = AOPOptions> {
  /**
   * Before decorator
   * @param context - Method and options context
   * @returns Callback function
   */
  before(context: UnitAOPContext<O>): AOPMethod<void>;
}

export interface AfterAOP<O extends AOPOptions = AOPOptions> {
  /**
   * After decorator
   * @param context - Method and options context
   * @returns Callback function
   */
  after(context: UnitAOPContext<O>): AOPMethod<void>;
}

export interface AfterReturningAOP<O extends AOPOptions = AOPOptions, T = any> {
  /**
   * AfterReturning decorator
   * @param context - Method, options, and result context
   * @returns Callback function
   */
  afterReturning(context: ResultAOPContext<O, T>): AOPMethod<void>;
}

export interface AfterThrowingAOP<O extends AOPOptions = AOPOptions, E = unknown> {
  /**
   * AfterThrowing decorator
   * @param context - Method, options, and error context
   * @returns Callback function
   */
  afterThrowing(context: ErrorAOPContext<O, E>): AOPMethod<void>;
}
