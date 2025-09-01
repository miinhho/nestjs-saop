# Type Alias: UnitAOPContext\<O\>

```ts
type UnitAOPContext<O> = Pick<AOPContext<O>, "method" | "options">;
```

Simplified context used for AOP advice that doesn't need access to
method results or errors.

(`before`, `after`, `around` advice)

## Type Parameters

### O

`O` = [`AOPOptions`](../interfaces/AOPOptions.md)

Options type
