# Interface: AfterThrowingAOP\<O, E\>

Contract for after-throwing advice, which executes only when
the target method throws an exception. Provides access to the thrown error.

## Type Parameters

### O

`O` *extends* [`AOPOptions`](AOPOptions.md) = [`AOPOptions`](AOPOptions.md)

Options type

### E

`E` = `unknown`

Error type (default: `unknown`)

## Methods

### afterThrowing()

```ts
afterThrowing(context): AOPMethod<void>;
```

AfterThrowing decorator method

See [AOPDecorator.afterThrowing](../classes/AOPDecorator.md#afterthrowing-2) for details.

#### Parameters

##### context

[`ErrorAOPContext`](../type-aliases/ErrorAOPContext.md)\<`O`, `E`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>
