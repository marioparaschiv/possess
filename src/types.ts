import type { PatchType } from './patcher';


export interface PatchedModule {
	parent: WeakRef<PatchParent>;
	method: PatchMethod;
	original: AnyFunction & AnyConstructor;
	patches: {
		[PatchType.Before]: Set<Patch>,
		[PatchType.Instead]: Set<Patch>,
		[PatchType.After]: Set<Patch>;
	};
}

export type PatchParent = AnyFunction | AnyObject;
export type PatchMethod = string;
export type PatchCallback = (ctx: PatchCallbackContext) => any;

export interface Patch extends PatchOptions {
	callback: PatchCallback;
}

export interface PatchOptions {
	once?: boolean;
	caller?: string;
}

export interface PatchCallbackContext {
	original: AnyFunction;
	this: any;
	result: any;
	args: any[];
}

export interface PatcherInstance {
	instead: typeof import('.').instead,
	before: typeof import('.').before,
	after: typeof import('.').after,
	unpatchAll: () => void;
}

export type AnyObject = Record<any, any>;
export type AnyFunction = (...args: any[]) => any;
export type AnyConstructor = { new(...args: any): any; };
export type PropOf<M> = {
	[K in keyof M]: M[K] extends AnyFunction | AnyConstructor ? Extract<K, string> : never
}[keyof M];