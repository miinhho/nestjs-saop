# Type Alias: ErrorAOPContext\<O, E\>

```ts
type ErrorAOPContext<O, E> = Pick<AOPContext<O, unknown, E>, "method" | "options" | "error">;
```

Context used for `after-throwing` advice, providing access to the
exception thrown by the method along with the standard context information.

## Type Parameters

### O

`O` = [`AOPOptions`](../interfaces/AOPOptions.md)

Options type

### E

`E` = `unknown`

Error type (default: `unknown`)
