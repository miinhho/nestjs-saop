# Type Alias: ResultAOPContext\<Options, ReturnType\>

```ts
type ResultAOPContext<Options, ReturnType> = Pick<AOPContext<Options, ReturnType>, "method" | "options" | "result">;
```

Context used for `after-returning` advice, providing access to the
method's return value along with the standard context information.

## Type Parameters

### Options

`Options` = [`AOPOptions`](AOPOptions.md)

### ReturnType

`ReturnType` = `any`
