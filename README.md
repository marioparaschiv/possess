# Possess

Structured monkey-patching for JavaScript and TypeScript. Hook into any function with `before`, `instead`, and `after` patches, then cleanly revert when you're done.

[![npm version](https://img.shields.io/npm/v/possess)](https://www.npmjs.com/package/possess)
[![license](https://img.shields.io/github/license/marioparaschiv/possess)](https://github.com/marioparaschiv/possess/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/marioparaschiv/possess/tests.yml)](https://github.com/marioparaschiv/possess/actions)

## Features

- `before`, `instead`, and `after` hooks for any function or constructor
- Full type inference for arguments, return type, and `this` context
- Scoped patchers via `createPatcher()` for grouped cleanup
- One-shot patches with `{ once: true }`
- Individual, per-caller, or global unpatch
- WeakRef-based, so patched objects can still be garbage collected
- Patches are isolated with try/catch. One bad callback won't break the rest.
- Preserves `.toString()` and property descriptors on patched functions
- Zero runtime dependencies

## Install

```bash
npm install possess
```

```bash
bun add possess
```

## Quick start

```typescript
import { before } from 'possess';

const api = {
  greet: (name: string) => `Hello ${name}!`
};

// Intercept arguments before execution
const unpatch = before(api, 'greet', (ctx) => {
  ctx.args[0] = ctx.args[0].toUpperCase();
});

api.greet('world'); // "Hello WORLD!"

// Remove the patch
unpatch();

api.greet('world'); // "Hello world!"
```

## API

### `before(parent, method, callback, options?)`

Runs before the original function. You can modify arguments here.

```typescript
import { before } from 'possess';

// Modify arguments via ctx.args
before(api, 'greet', (ctx) => {
  ctx.args[0] = 'Override';
});

// Or return a new arguments array
before(api, 'greet', (ctx) => {
  return ['Override'];
});
```

### `instead(parent, method, callback, options?)`

Replaces the original function. The original is *not* called unless you call `ctx.original()` yourself.

```typescript
import { instead } from 'possess';

// Complete replacement
instead(api, 'greet', (ctx) => {
  return `Goodbye ${ctx.args[0]}!`;
});

// Delegate to original
instead(api, 'greet', (ctx) => {
  return ctx.original(...ctx.args);
});

// Modify arguments, then delegate
instead(api, 'greet', (ctx) => {
  return ctx.original(ctx.args[0].toUpperCase());
});
```

### `after(parent, method, callback, options?)`

Runs after the original (or any `instead` patches). You can read or change the result.

```typescript
import { after } from 'possess';

// Override the result by returning a value
after(api, 'greet', (ctx) => {
  return ctx.result + ' (modified)';
});

// Or modify ctx.result directly
after(api, 'greet', (ctx) => {
  ctx.result = ctx.result + ' (modified)';
});
```

### `createPatcher(caller)`

Creates a scoped patcher. All patches share a caller ID, so you can remove them together.

```typescript
import { createPatcher } from 'possess';

const patcher = createPatcher('my-plugin');

patcher.before(api, 'greet', (ctx) => {
  console.log('greet called with:', ctx.args);
});

patcher.after(api, 'greet', (ctx) => {
  console.log('greet returned:', ctx.result);
});

// Only removes patches from this patcher
patcher.unpatchAll();
```

Also accepts an options object:

```typescript
const patcher = createPatcher({ caller: 'my-plugin' });
```

### `unpatchAll()`

Removes every active patch globally.

```typescript
import { unpatchAll } from 'possess';

unpatchAll();
```

### `unpatchAllByCaller(caller)`

Removes all patches with a given caller ID.

```typescript
import { unpatchAllByCaller } from 'possess';

unpatchAllByCaller('my-plugin');
```

### PatchContext

Every callback receives a `PatchContext` object:

| Property | Type | Description |
|----------|------|-------------|
| `ctx.args` | `Args` | The function arguments. Mutable in `before` callbacks. |
| `ctx.result` | `Res \| null` | The return value. `null` before execution, populated in `after`. |
| `ctx.original` | `(...args) => Res` | The original unpatched function. |
| `ctx.this` | `Self` | The `this` binding of the current call. |

### PatchOptions

| Option | Type | Description |
|--------|------|-------------|
| `once` | `boolean` | Remove the patch automatically after it runs once. |
| `caller` | `string` | Groups patches together. Used by `unpatchAllByCaller()`. |

```typescript
import { before } from 'possess';

// Fires once, then removes itself
before(api, 'greet', (ctx) => {
  console.log('First call only:', ctx.args);
}, { once: true });
```

## Class patching

Same API, works with constructors:

```typescript
import { before, instead, after } from 'possess';

const module = {
  User: class User {
    name: string;
    constructor(name: string) {
      this.name = name;
    }
  }
};

// Modify constructor arguments
before(module, 'User', (ctx) => {
  ctx.args[0] = ctx.args[0].toUpperCase();
});

// Intercept construction
instead(module, 'User', (ctx) => {
  const instance = ctx.original(...ctx.args);
  instance.name = 'Intercepted';
  return instance;
});

// Modify the instance after construction
after(module, 'User', (ctx) => {
  ctx.result.name = ctx.result.name + ' (patched)';
});
```

## Execution order

1. All `before` patches (registration order)
2. All `instead` patches, or the original function if there are none
3. All `after` patches (registration order)

## Error handling

Each callback is wrapped in a try/catch. If a patch throws, the error goes to `console.error` and the next patch runs normally.

## License

[GPL-3.0](LICENSE)
