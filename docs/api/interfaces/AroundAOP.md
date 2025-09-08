# Interface: AroundAOP\<Options, ReturnType\>

Contract for around advice, which wraps the entire method execution.

Allows complete control over method invocation, including the ability to modify
parameters, skip execution, or alter the return value.

## Type Parameters

### Options

`Options` = [`AOPOptions`](AOPOptions.md)

### ReturnType

`ReturnType` = `any`

## Methods

### around()

```ts
around(context): AOPMethod<ReturnType>;
```

Around decorator method

See [AOPDecorator.around](../classes/AOPDecorator.md#around-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`Options`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`ReturnType`\>
