# Interface: AfterReturningAOP\<O, T\>

Contract for after-returning advice, which executes only when
the target method completes successfully without throwing an exception.

Provides access to the method's return value.

## Type Parameters

### O

`O` *extends* [`AOPOptions`](AOPOptions.md) = [`AOPOptions`](AOPOptions.md)

Options type

### T

`T` = `any`

Method return type (default: `any`)

## Methods

### afterReturning()

```ts
afterReturning(context): AOPMethod<void>;
```

AfterReturning decorator method

See [AOPDecorator.afterReturning](../classes/AOPDecorator.md#afterreturning-2) for details.

#### Parameters

##### context

[`ResultAOPContext`](../type-aliases/ResultAOPContext.md)\<`O`, `T`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>
