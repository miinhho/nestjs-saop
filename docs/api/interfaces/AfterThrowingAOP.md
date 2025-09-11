# Interface: AfterThrowingAOP\<Options, ErrorType\>

Contract for after-throwing advice, which executes only when
the target method throws an exception. Provides access to the thrown error.

## Type Parameters

### Options

`Options` *extends* [`AOPOptions`](../type-aliases/AOPOptions.md) = [`AOPOptions`](../type-aliases/AOPOptions.md)

### ErrorType

`ErrorType` = `unknown`

## Methods

### afterThrowing()

```ts
afterThrowing(context): AOPMethod<void>;
```

AfterThrowing decorator method

See [AOPDecorator.afterThrowing](../classes/AOPDecorator.md#afterthrowing-2) for details.

#### Parameters

##### context

[`ErrorAOPContext`](../type-aliases/ErrorAOPContext.md)\<`Options`, `ErrorType`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>
