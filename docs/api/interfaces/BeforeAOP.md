# Interface: BeforeAOP\<Options\>

Contract for before advice, which executes before the target method.

## Type Parameters

### Options

`Options` = [`AOPOptions`](AOPOptions.md)

## Methods

### before()

```ts
before(context): AOPMethod<void>;
```

Before decorator method

See [AOPDecorator.before](../classes/AOPDecorator.md#before-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`Options`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>
