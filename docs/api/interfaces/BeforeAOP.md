# Interface: BeforeAOP\<O\>

Contract for before advice, which executes before the target method.

## Type Parameters

### O

`O` *extends* [`AOPOptions`](AOPOptions.md) = [`AOPOptions`](AOPOptions.md)

Options type

## Methods

### before()

```ts
before(context): AOPMethod<void>;
```

Before decorator method

See [AOPDecorator.before](../classes/AOPDecorator.md#before-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`O`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>
