# Interface: IAOPDecorator\<O, T, E\>

Base interface for all AOP decorators, providing optional implementations
for various AOP advice types (around, before, after, etc.).

## Extends

- `Partial`\<[`AroundAOP`](AroundAOP.md)\<`O`, `T`\>\>.`Partial`\<[`BeforeAOP`](BeforeAOP.md)\<`O`\>\>.`Partial`\<[`AfterAOP`](AfterAOP.md)\<`O`\>\>.`Partial`\<[`AfterReturningAOP`](AfterReturningAOP.md)\<`O`, `T`\>\>.`Partial`\<[`AfterThrowingAOP`](AfterThrowingAOP.md)\<`O`, `E`\>\>

## Type Parameters

### O

`O` *extends* [`AOPOptions`](AOPOptions.md) = [`AOPOptions`](AOPOptions.md)

Options type

### T

`T` = `any`

Method return type (default: `any`)

### E

`E` = `unknown`

Error type (default: `unknown`)

## Properties

### after()?

```ts
optional after: (context) => AOPMethod<void>;
```

After decorator method

See [AOPDecorator.after](../classes/AOPDecorator.md#after-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`O`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

#### Inherited from

[`after`](#after).`__type`

***

### afterReturning()?

```ts
optional afterReturning: (context) => AOPMethod<void>;
```

AfterReturning decorator method

See [AOPDecorator.afterReturning](../classes/AOPDecorator.md#afterreturning-2) for details.

#### Parameters

##### context

[`ResultAOPContext`](../type-aliases/ResultAOPContext.md)\<`O`, `T`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

#### Inherited from

[`afterReturning`](#afterreturning).`__type`

***

### afterThrowing()?

```ts
optional afterThrowing: (context) => AOPMethod<void>;
```

AfterThrowing decorator method

See [AOPDecorator.afterThrowing](../classes/AOPDecorator.md#afterthrowing-2) for details.

#### Parameters

##### context

[`ErrorAOPContext`](../type-aliases/ErrorAOPContext.md)\<`O`, `E`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

#### Inherited from

[`afterThrowing`](#afterthrowing).`__type`

***

### around()?

```ts
optional around: (context) => AOPMethod<T>;
```

Around decorator method

See [AOPDecorator.around](../classes/AOPDecorator.md#around-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`O`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`T`\>

#### Inherited from

[`around`](#around).`__type`

***

### before()?

```ts
optional before: (context) => AOPMethod<void>;
```

Before decorator method

See [AOPDecorator.before](../classes/AOPDecorator.md#before-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`O`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

#### Inherited from

[`before`](#before).`__type`
