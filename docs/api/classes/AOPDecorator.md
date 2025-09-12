# Abstract Class: AOPDecorator\<Options\>

Provides the foundation for creating custom AOP decorators.

## Example

```typescript
＠Aspect()
export class LoggingAOP extends AOPDecorator {
  around({ method, options }: UnitAOPContext) {
   return (...args: any[]) => {
     console.log('Around: Before method call', ...args, options);
     const result = method.apply(this, args);
     console.log('Around: After method call', result);
     return result;
   };
  }

 // ... implement other advice methods as needed
 // e.g. before, after, afterReturning, afterThrowing
}
```

## Type Parameters

### Options

`Options` *extends* [`AOPOptions`](../type-aliases/AOPOptions.md) = [`AOPOptions`](../type-aliases/AOPOptions.md)

## Implements

- [`IAOPDecorator`](../interfaces/IAOPDecorator.md)\<`Options`\>

## Constructors

### Constructor

```ts
new AOPDecorator<Options>(): AOPDecorator<Options>;
```

#### Returns

`AOPDecorator`\<`Options`\>

## Methods

### after()?

```ts
optional after(context): AOPMethod<void>;
```

After decorator method (optional implementation)

Executed after the target method completes, whether successfully or with an error.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`Options`\>

Context containing the original method and options

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

A callback function executed after the method

#### Implementation of

[`IAOPDecorator`](../interfaces/IAOPDecorator.md).[`after`](../interfaces/IAOPDecorator.md#after)

***

### afterReturning()?

```ts
optional afterReturning(context): AOPMethod<void>;
```

AfterReturning decorator method (optional implementation)

Executed after the target method returns successfully. Has access to
the return value.

#### Parameters

##### context

[`ResultAOPContext`](../type-aliases/ResultAOPContext.md)\<`Options`\>

Context containing the method, options, and result

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

A callback function executed after successful method completion

#### Implementation of

[`IAOPDecorator`](../interfaces/IAOPDecorator.md).[`afterReturning`](../interfaces/IAOPDecorator.md#afterreturning)

***

### afterThrowing()?

```ts
optional afterThrowing(context): AOPMethod<void>;
```

AfterThrowing decorator method (optional implementation)

Executed when the target method throws an exception.

#### Parameters

##### context

[`ErrorAOPContext`](../type-aliases/ErrorAOPContext.md)\<`Options`\>

Context containing the method, options, and error

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

A callback function executed when an exception occurs

#### Implementation of

[`IAOPDecorator`](../interfaces/IAOPDecorator.md).[`afterThrowing`](../interfaces/IAOPDecorator.md#afterthrowing)

***

### around()?

```ts
optional around(context): AOPMethod<any>;
```

Around decorator method (optional implementation)

Full control over execution.

Allows complete control over method invocation, including the ability to modify
parameters, skip execution, or alter the return value.

#### Parameters

##### context

[`AroundAOPContext`](../type-aliases/AroundAOPContext.md)\<`Options`\>

Context containing the original method metadata and the proceed function to continue execution.

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`any`\>

A wrapped method function that will be executed

#### Implementation of

[`IAOPDecorator`](../interfaces/IAOPDecorator.md).[`around`](../interfaces/IAOPDecorator.md#around)

***

### before()?

```ts
optional before(context): AOPMethod<void>;
```

Before decorator method (optional implementation)

Executed before the target method runs.

#### Parameters

##### context

[`UnitAOPContext`](../type-aliases/UnitAOPContext.md)\<`Options`\>

Context containing the original method and options

#### Returns

[`AOPMethod`](../type-aliases/AOPMethod.md)\<`void`\>

A callback function executed before the method

#### Implementation of

[`IAOPDecorator`](../interfaces/IAOPDecorator.md).[`before`](../interfaces/IAOPDecorator.md#before)

***

### after()

```ts
static after<Options>(this, options): MethodDecorator;
```

Creates a method decorator that applies after advice to the target method.

The after advice executes after the method completes, regardless of whether
it succeeded or threw an exception.

#### Type Parameters

##### Options

`Options` *extends* [`AOPOptions`](../type-aliases/AOPOptions.md) = [`AOPOptions`](../type-aliases/AOPOptions.md)

#### Parameters

##### this

`AOPDecoratorConstructor`\<`Options`\> & [`AfterAOP`](../interfaces/AfterAOP.md)\<`Options`\>

##### options

`Options` = `...`

Configuration options for the decorator

#### Returns

`MethodDecorator`

A method decorator function

#### Example

```typescript
＠LoggingAOP.after<LoggingOptions>({
  logLevel: 'info',
})
getHello(name: string): string {
  return `Hello ${name}!`;
}
```

***

### afterReturning()

```ts
static afterReturning<Options>(this, options): MethodDecorator;
```

Creates a method decorator that applies after-returning advice to the target method.

The after-returning advice executes only when the method completes successfully
and provides access to the return value for post-processing.

#### Type Parameters

##### Options

`Options` *extends* [`AOPOptions`](../type-aliases/AOPOptions.md) = [`AOPOptions`](../type-aliases/AOPOptions.md)

#### Parameters

##### this

`AOPDecoratorConstructor`\<`Options`\> & [`AfterReturningAOP`](../interfaces/AfterReturningAOP.md)\<`Options`, `any`\>

##### options

`Options` = `...`

Configuration options for the decorator

#### Returns

`MethodDecorator`

A method decorator function

#### Example

```typescript
＠LoggingAOP.afterReturning<LoggingOptions>({
  logLevel: 'info',
})
getHello(name: string): string {
  return `Hello ${name}!`;
}
```

***

### afterThrowing()

```ts
static afterThrowing<Options>(this, options): MethodDecorator;
```

Creates a method decorator that applies after-throwing advice to the target method.

The after-throwing advice executes only when the method throws an exception
and provides access to the error for logging, recovery, or re-throwing.

#### Type Parameters

##### Options

`Options` *extends* [`AOPOptions`](../type-aliases/AOPOptions.md) = [`AOPOptions`](../type-aliases/AOPOptions.md)

#### Parameters

##### this

`AOPDecoratorConstructor`\<`Options`\> & [`AfterThrowingAOP`](../interfaces/AfterThrowingAOP.md)\<`Options`, `unknown`\>

##### options

`Options` = `...`

Configuration options for the decorator

#### Returns

`MethodDecorator`

A method decorator function

#### Example

```typescript
＠LoggingAOP.afterThrowing<LoggingOptions>({
  logLevel: 'error',
})
getError(): string {
  throw new Error('This is a test error');
}
```

***

### around()

```ts
static around<Options>(this, options): MethodDecorator;
```

Creates a method decorator that applies around advice to the target method.

The around advice has full control over method execution and can modify
parameters, conditionally execute the method, or return a different result.

#### Type Parameters

##### Options

`Options` *extends* [`AOPOptions`](../type-aliases/AOPOptions.md) = [`AOPOptions`](../type-aliases/AOPOptions.md)

#### Parameters

##### this

`AOPDecoratorConstructor`\<`Options`\> & [`AroundAOP`](../interfaces/AroundAOP.md)\<`Options`, `any`\>

##### options

`Options` = `...`

Configuration options for the decorator

#### Returns

`MethodDecorator`

A method decorator function

#### Example

```typescript
＠LoggingAOP.around<LoggingOptions>({
  logLevel: 'info',
})
getHello(name: string): string {
  return `Hello ${name}!`;
}
```

***

### before()

```ts
static before<Options>(this, options): MethodDecorator;
```

Creates a method decorator that applies before advice to the target method.

The before advice executes before the method runs.

#### Type Parameters

##### Options

`Options` *extends* [`AOPOptions`](../type-aliases/AOPOptions.md) = [`AOPOptions`](../type-aliases/AOPOptions.md)

#### Parameters

##### this

`AOPDecoratorConstructor`\<`Options`\> & [`BeforeAOP`](../interfaces/BeforeAOP.md)\<`Options`\>

##### options

`Options` = `...`

Configuration options for the decorator

#### Returns

`MethodDecorator`

A method decorator function

#### Example

```typescript
＠LoggingAOP.before<LoggingOptions>({
  logLevel: 'info',
})
getHello(name: string): string {
  return `Hello ${name}!`;
}
```
