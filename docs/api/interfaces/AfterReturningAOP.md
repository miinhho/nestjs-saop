# Interface: AfterReturningAOP\<Options, ReturnType\>

Contract for after-returning advice, which executes only when
the target method completes successfully without throwing an exception.

Provides access to the method's return value.

## Type Parameters

### Options

`Options` = [`AOPOptions`](../type-aliases/AOPOptions.md)

### ReturnType

`ReturnType` = `any`

## Methods

### afterReturning()

```ts
afterReturning(context): AOPMethod<void>;
```

AfterReturning decorator method

See [AOPDecorator.afterReturning](../classes/AOPDecorator.md#afterreturning-2) for details.

#### Parameters

##### context

[`ResultAOPContext`](../type-aliases/ResultAOPContext.md)\<`Options`, `ReturnType`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>
