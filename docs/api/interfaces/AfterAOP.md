# Interface: AfterAOP\<Options\>

Contract for after advice, which executes after the target method,
regardless of whether it completed successfully or threw an exception.

## Type Parameters

### Options

`Options` = [`AOPOptions`](AOPOptions.md)

## Methods

### after()

```ts
after(context): AOPMethod<void>;
```

After decorator method

See [AOPDecorator.after](../classes/AOPDecorator.md#after-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`Options`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>
