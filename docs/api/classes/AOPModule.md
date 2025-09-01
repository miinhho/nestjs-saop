# Class: AOPModule

Main AOP module for NestJS

It automatically discovers AOP decorators and applies them to target methods at runtime.

## Implements

- `OnModuleInit`

## Constructors

### Constructor

```ts
new AOPModule(
   instanceCollector, 
   methodProcessor, 
   decoratorApplier): AOPModule;
```

#### Parameters

##### instanceCollector

`InstanceCollector`

##### methodProcessor

`MethodProcessor`

##### decoratorApplier

`DecoratorApplier`

#### Returns

`AOPModule`

## Methods

### onModuleInit()

```ts
onModuleInit(): void;
```

Lifecycle hook called when the module is initialized.

Triggers the AOP system setup process.

#### Returns

`void`

#### Implementation of

```ts
OnModuleInit.onModuleInit
```

***

### forRoot()

```ts
static forRoot(): DynamicModule;
```

Configure AOP module as global

#### Returns

`DynamicModule`

Dynamic module configuration for global AOP support
