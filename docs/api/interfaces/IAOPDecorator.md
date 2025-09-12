# Interface: IAOPDecorator\<Options, ReturnType, ErrorType\>

Base interface for all AOP decorators, providing optional implementations
for various AOP advice types (around, before, after, etc.).

## Extends

- `Partial`\<[`AroundAOP`](AroundAOP.md)\<`Options`, `ReturnType`\>\>.`Partial`\<[`BeforeAOP`](BeforeAOP.md)\<`Options`\>\>.`Partial`\<[`AfterAOP`](AfterAOP.md)\<`Options`\>\>.`Partial`\<[`AfterReturningAOP`](AfterReturningAOP.md)\<`Options`, `ReturnType`\>\>.`Partial`\<[`AfterThrowingAOP`](AfterThrowingAOP.md)\<`Options`, `ErrorType`\>\>

## Type Parameters

### Options

`Options` *extends* [`AOPOptions`](../type-aliases/AOPOptions.md) = [`AOPOptions`](../type-aliases/AOPOptions.md)

### ReturnType

`ReturnType` = `any`

### ErrorType

`ErrorType` = `unknown`

## Properties

### after()?

```ts
optional after: (context) => AOPMethod<void>;
```

After decorator method

See [AOPDecorator.after](../classes/AOPDecorator.md#after-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`Options`\>

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

[`ResultAOPContext`](../type-aliases/ResultAOPContext.md)\<`Options`, `ReturnType`\>

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

[`ErrorAOPContext`](../type-aliases/ErrorAOPContext.md)\<`Options`, `ErrorType`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

#### Inherited from

[`afterThrowing`](#afterthrowing).`__type`

***

### around()?

```ts
optional around: (context) => AOPMethod<ReturnType>;
```

Around decorator method

See [AOPDecorator.around](../classes/AOPDecorator.md#around-2) for details.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`Options`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`ReturnType`\>

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

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`Options`\>

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

#### Inherited from

[`before`](#before).`__type`
