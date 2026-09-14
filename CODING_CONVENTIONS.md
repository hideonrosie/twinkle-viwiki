# Twinkle Coding Conventions

This page describes the coding conventions for TypeScript and JavaScript in the Twinkle2026 (vi.wikipedia.org) codebase. While inspired by MediaWiki's conventions, this document reflects the **actual tooling and patterns** used in this repository.

## Linting and Formatting

Twinkle2026 uses **ESLint** for catching logical errors and **Prettier** for automated code formatting. Formatting concerns like spacing, indentation, and line wrapping are entirely handled by Prettier.

### Configuration
* **Prettier**: Configured in `.prettierrc` (uses tabs, 100-character line limit, single quotes).
* **ESLint**: Configured in `.eslintrc.json` using `eslint:recommended` and `@typescript-eslint`. Formatting-related rules (like `no-mixed-spaces-and-tabs`) are intentionally disabled to avoid clashes with Prettier.

### Continuous Integration
The repository uses Husky and `lint-staged`. When you commit, a pre-commit hook automatically runs `prettier --write` on staged files.

You can manually format and lint your code using:
```bash
npm run format
npm run lint
```

## Whitespace and Formatting

Unlike MediaWiki's default JavaScript style, this repository relies on **Prettier's default formatting**:
* **Indentation**: Use **tabs**.
* **Line length**: Maximum **100 characters**. Prettier will automatically wrap long function calls, arrays, and objects.
* **Quotes**: Use **single quotes** (`'`).
* **Parentheses spacing**: Do **NOT** leave spaces inside parentheses (unless forced by multiline wrapping). This directly contrasts with MediaWiki style.

**Yes (Prettier style - Used in Twinkle)**
```typescript
a.foo = bar + baz;

if (foo) {
	foo.bar = doBar();
}

function baz(foo, bar) {
	return 'gaz';
}

baz('banana', 'pear');
foo = bar[0];
```

**No (MediaWiki style - Prettier will remove these spaces)**
```typescript
if ( foo ) {
	foo.bar = doBar();
}

function baz( foo, bar ) {
	return 'gaz';
}

baz( 'banana', 'pear' );
foo = bar[ 0 ];
```

## Declarations

Variables must be declared before use. Since the project uses TypeScript/ES6, `let` and `const` are supported and encouraged for new code. However, `var` is still heavily used due to legacy code.

When writing callbacks, prefer **Arrow Functions** (`=>`) to naturally preserve the `this` context without needing `.bind(this)` or `var self = this;`.

**Yes**
```typescript
pageDeleter.run((pageName) => {
	this.callbacks.doExtras(pageName);
});
```

**No**
```typescript
var self = this;
pageDeleter.run(function(pageName) {
	self.callbacks.doExtras(pageName);
});
```

## Naming

Because this is a TypeScript project, consistent naming conventions help maintain readability:

*   **Classes**: `PascalCase` (e.g., `BlockCore`, `TwinkleModule`, `Page`, `User`).
*   **Functions and Variables**: `camelCase` (e.g., `makeWindow`, `processUserInfo`).
*   **Event Handlers**: Form and UI event handlers inside modules traditionally use `snake_case` (e.g., `change_action`, `change_block64`, `toggle_see_alsos`).
*   **Utility Shims**: ES6 polyfills/shims in `utils.ts` use prefixed `snake_case` (e.g., `obj_entries`, `arr_includes`).

## Modules and Core Code

The project uses ES6 Modules (`import` and `export`) rather than wrapping files in closures or attaching properties to global variables.

### Module Structure (`twinkle-core/src/modules/`)
Most modules follow an object-oriented design inherited from `TwinkleModule`.
* **Inheritance**: Export a class extending `TwinkleModule`.
* **Properties**: Define properties like `moduleName`, `portletName`, and `portletId`.
* **UI**: The `makeWindow()` method is the standard entry point for constructing interfaces using `Morebits.quickForm`, `Dialog`, and `Morebits.status`.

**Example:**
```typescript
import { TwinkleModule } from '../twinkleModule';
import { msg } from '../messenger';

export class MyModule extends TwinkleModule {
	moduleName = 'mymodule';
	portletId = 'twinkle-mymodule';
	
	makeWindow() {
		// UI Initialization
	}
}
```

### Shared Utilities (`twinkle-core/src/`)
Do not duplicate logic across modules. Check `utils.ts`, `Page.ts`, and `User.ts` for existing utilities. The project has heavily wrapped and optimized MediaWiki API calls in these core files.

## Comments

* **JSDoc**: Use JSDoc-style comments (`/** ... */`) to document the purpose of classes, modules, and significant methods. TypeScript handles the parameter types, so verbose `@param` tags are only necessary when explaining complex behavior.
* **Inline Comments**: Use single-line comments (`//`) to explain non-obvious logic, MediaWiki API quirks, or Phabricator workarounds. Block comments (`/* ... */`) should generally be reserved for temporarily disabling code blocks.

## Asynchronous Code

The codebase uses a mix of jQuery Promises (`$.Deferred()`) from Morebits legacy and native Promises (`async`/`await`).

*   When interacting with `Page` or `User` objects from `twinkle-core/src/`, legacy methods have been promisified. You can safely use `.then()` or `await`.
*   When interacting directly with `Morebits.wiki.api` or `Morebits.wiki.batchOperation`, you must stick to their traditional `onSuccess` and `onFailure` callback structure.

**Yes (Using wrapped Promises)**
```typescript
pageObj.load().then(
	() => { console.log('Success'); },
	(err) => { console.error('Failed', err); }
);
```

**Yes (Using traditional Morebits callbacks)**
```typescript
var pageDeleter = new Morebits.batchOperation('Deleting pages');
pageDeleter.run(
	(pageName) => {
		// Worker function
	},
	() => {
		// Post-action function
	}
);
```
