# Function: Aspect()

```ts
function Aspect(options): ClassDecorator;
```

Class decorator to mark a class as AOP decorator

Classes decorated with ＠Aspect are automatically registered as injectable
services and can be used to apply cross-cutting concerns to methods.

## Parameters

### options

`AspectOptions` = `{}`

Configuration options for the aspect.

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
