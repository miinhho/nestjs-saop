# Type Alias: ErrorAOPContext\<Options, ErrorType\>

```ts
type ErrorAOPContext<Options, ErrorType> = Pick<AOPContext<Options, unknown, ErrorType>, "method" | "options" | "error">;
```

Context used for `after-throwing` advice, providing access to the
exception thrown by the method along with the standard context information.

## Type Parameters

### Options

`Options` = [`AOPOptions`](../interfaces/AOPOptions.md)

### ErrorType

`ErrorType` = `unknown`
