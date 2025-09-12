# Type Alias: UnitAOPContext\<Options\>

```ts
type UnitAOPContext<Options> = Pick<AOPContext<Options>, "method" | "options">;
```

Simplified context used for AOP advice that doesn't need access to
method results or errors.

(`before`, `after` advice)

## Type Parameters

### Options

`Options` *extends* [`AOPOptions`](AOPOptions.md) = [`AOPOptions`](AOPOptions.md)
