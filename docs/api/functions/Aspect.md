# Function: Aspect()

```ts
function Aspect(): ClassDecorator;
```

Class decorator to mark a class as AOP decorator

Classes decorated with ＠Aspect are automatically registered as injectable
services and can be used to apply cross-cutting concerns to methods.

## Returns

`ClassDecorator`

A class decorator function

## Example

```typescript
＠Aspect()
export class LoggingAspect {
  // AOP methods will be implemented here
}
```
