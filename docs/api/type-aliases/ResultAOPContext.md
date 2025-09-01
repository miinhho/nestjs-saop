# Type Alias: ResultAOPContext\<O, T\>

```ts
type ResultAOPContext<O, T> = Pick<AOPContext<O, T>, "method" | "options" | "result">;
```

Context used for `after-returning` advice, providing access to the
method's return value along with the standard context information.

## Type Parameters

### O

`O` = [`AOPOptions`](../interfaces/AOPOptions.md)

Options type

### T

`T` = `any`

Method return type (default: `any`)
