# Type Alias: UnitAOPContext\<Options\>

```ts
type UnitAOPContext<Options> = Pick<AOPContext<Options>, "method" | "options">;
```

Simplified context used for AOP advice that doesn't need access to
method results or errors.

(`before`, `after`, `around` advice)

## Type Parameters

### Options

`Options` = [`AOPOptions`](../interfaces/AOPOptions.md)
