# Interface: AroundAOP\<O, T\>

Contract for around advice, which wraps the entire method execution.

Allows complete control over method invocation, including the ability to modify
parameters, skip execution, or alter the return value.

## Type Parameters

### O

`O` *extends* [`AOPOptions`](AOPOptions.md) = [`AOPOptions`](AOPOptions.md)

Options type

### T

`T` = `any`

Method return type (default: `any`)

## Methods

### around()

```ts
around(context): AOPMethod<T>;
```

Around decorator method

See [AOPDecorator.around](../classes/AOPDecorator.md#around-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`O`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`T`\>
