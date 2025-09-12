# Function: Aspect()

```ts
function Aspect(order): ClassDecorator;
```

Class decorator to mark a class as AOP decorator

Classes decorated with ＠Aspect are automatically registered as injectable
services and can be used to apply cross-cutting concerns to methods.

## Parameters

### order

`AspectOptions` = `{}`

The order in which this aspect should be applied. Lower values execute first.

## Returns

`ClassDecorator`

A class decorator function

## Example

```typescript
＠Aspect({ order: 1 })
export class LoggingAspect {
  // AOP methods will be implemented here
}
```
