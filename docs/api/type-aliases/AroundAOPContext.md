# Type Alias: AroundAOPContext\<Options\>

```ts
type AroundAOPContext<Options> = object;
```

Context used specifically for `around` advice, providing access to both
the original method metadata and the proceed function to continue execution.

## Type Parameters

### Options

`Options` *extends* [`AOPOptions`](AOPOptions.md) = [`AOPOptions`](AOPOptions.md)

## Properties

### instance

```ts
instance: object;
```

Class instance being decorated

***

### method

```ts
method: Function;
```

The original method function being intercepted (for metadata)

***

### options

```ts
options: Options;
```

Configuration options passed to the decorator

***

### proceed

```ts
proceed: Function;
```

Function to proceed with the next advice
