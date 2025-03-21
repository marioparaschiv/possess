import type { AnyObject, PatchCallback, PatchCallbackContext, PatchedModule, PatchParent, PropOf, PatchOptions, Patch, PatcherInstance } from './types';


export const PATCH_SYMBOL = Symbol.for('$$patched$$');


export enum PatchType {
	Before,
	Instead,
	After
}

export const patches: PatchedModule[] = [];

export function before<M extends PatchParent, P extends PropOf<M>>(parent: M, method: P, callback: PatchCallback, options: PatchOptions = {}) {
	return patch(PatchType.Before, parent, method, callback, options);
}

export function instead<M extends PatchParent, P extends PropOf<M>>(parent: M, method: P, callback: PatchCallback, options: PatchOptions = {}) {
	return patch(PatchType.Instead, parent, method, callback, options);
}

export function after<M extends PatchParent, P extends PropOf<M>>(parent: M, method: P, callback: PatchCallback, options: PatchOptions = {}) {
	return patch(PatchType.After, parent, method, callback, options);
}

export function createPatcher(defaultOptions: string | PatchOptions): PatcherInstance {
	if (typeof defaultOptions === 'string') {
		defaultOptions = { caller: defaultOptions };
	}

	defaultOptions.caller ??= crypto.randomUUID();

	return {
		instead: (parent, method, callback, options = {}) => instead(parent, method, callback, { ...defaultOptions, ...options }),
		before: (parent, method, callback, options = {}) => before(parent, method, callback, { ...defaultOptions, ...options }),
		after: (parent, method, callback, options = {}) => after(parent, method, callback, { ...defaultOptions, ...options }),
		unpatchAll: () => unpatchAllByCaller(defaultOptions.caller!)
	};
};

export function unpatchAllByCaller(caller: string) {
	for (const patch of patches) {
		for (const type in patch.patches) {
			const store = patch.patches[type as unknown as PatchType];
			if (!store.size) continue;

			const matched = store.values().filter(p => p.caller === caller);
			for (const match of matched) {
				unpatch(type as unknown as PatchType, patch, match);
			}
		}
	}
}

function patch<M extends PatchParent, P extends PropOf<M>>(type: PatchType, parent: M, method: P, callback: PatchCallback, options: PatchOptions) {
	if (!parent[method]) throw new Error(`The function you provided does not exist on the parent object.`);

	const mdl = getPatchedModule(parent, method);
	const original: any = parent[method];

	// Override method if it isn't already.
	if (!original[PATCH_SYMBOL]) {
		Object.defineProperty(parent, method, {
			value: createOverride(mdl),
			configurable: true,
			enumerable: true
		});
	}

	mdl.patches[type] ??= new Set();

	const store = mdl.patches[type];

	const patch = {
		callback,
		...options
	};

	store.add(patch);

	return () => unpatch(type, mdl, patch);
}

function unpatch(type: PatchType, mdl: PatchedModule, patch: Patch) {
	const store = mdl.patches[type];

	store.delete(patch);

	// Automatically delete patch record if there are no patches applied to restore original performance.
	const hasPatches = Object.values(mdl.patches).some(p => p.size);
	if (hasPatches) return;

	const parent = mdl.parent.deref();

	// Restore original function if parent still exists.
	if (parent) Object.defineProperty(parent, mdl.method, {
		value: mdl.original,
		configurable: true,
		enumerable: true
	});

	// Remove patch record from our store.
	const idx = patches.indexOf(mdl);
	if (idx > -1) patches.splice(idx, 1);
}

function createOverride(patch: PatchedModule) {
	function override(this: any, ...args: any[]) {
		const ctx: PatchCallbackContext = {
			result: null,
			this: this,
			args,
			original: (...args: any[]) => {
				if (new.target) {
					const Constructor = patch.original;
					return new Constructor(...args);
				} else {
					return patch.original.apply(this, args);
				}
			}
		};

		const beforePatches = [...patch.patches[PatchType.Before]];
		for (const before of beforePatches) {
			try {
				const args = before.callback.call(this, ctx);
				if (Array.isArray(args)) ctx.args = args;
				if (before.once) unpatch(PatchType.Before, patch, before);
			} catch (error) {
				console.error('[Patcher] Failed to execute patch callback of type before:', error);
			}
		}

		const insteadPatches = [...patch.patches[PatchType.Instead]];
		if (!insteadPatches.length) {
			ctx.result = ctx.original.apply(this, ctx.args);
		} else {
			for (const instead of insteadPatches) {
				try {
					const result = instead.callback.call(this, ctx);
					if (typeof result !== 'undefined') ctx.result = result;
					if (instead.once) unpatch(PatchType.Instead, patch, instead);
				} catch (error) {
					console.error('[Patcher] Failed to execute patch callback of type instead:', error);
				}
			}
		}

		const afterPatches = [...patch.patches[PatchType.After]];
		for (const after of afterPatches) {
			try {
				const result = after.callback.call(this, ctx);
				if (typeof result !== 'undefined') ctx.result = result;
				if (after.once) unpatch(PatchType.After, patch, after);
			} catch (error) {
				console.error('[Patcher] Failed to execute patch callback of type after:', error);
			}
		}

		return ctx.result;
	};

	// Restore descriptors from original function.
	const descriptors = Object.getOwnPropertyDescriptors(patch.original);
	delete descriptors.length;

	Object.defineProperties(override, {
		...descriptors,
		[PATCH_SYMBOL]: {
			value: true,
			configurable: true,
			enumerable: true
		},
		toString: {
			value: () => patch.original.toString(),
			configurable: true,
			enumerable: false
		}
	});

	return override;
}

function getPatchedModule<M extends AnyObject, P extends PropOf<M>>(parent: M, method: P) {
	const patch = patches.find(p => p.parent.deref() === parent && p.method === method);
	if (patch) return patch;

	const mdl = createPatchedModule(parent, method);

	patches.push(mdl);

	return mdl;
}

function createPatchedModule<M extends AnyObject, P extends PropOf<M>>(parent: M, method: P): PatchedModule {
	return {
		method,
		// Use a WeakRef so our patcher does not prevent the garbage collector from cleaning up the parent object.
		parent: new WeakRef(parent),
		original: parent[method],
		patches: {
			[PatchType.Before]: new Set(),
			[PatchType.Instead]: new Set(),
			[PatchType.After]: new Set()
		}
	};
}