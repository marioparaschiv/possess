import type { PatchType } from './patcher';


export interface PatchedModule {
	parent: WeakRef<PatchParent>;
	method: PatchMethod;
	original: AnyFunction & AnyConstructor;
	patches: Record<PatchType, Set<Patch<any, any, any>>>;
}

export type PatchParent = AnyFunction | AnyObject;
export type PatchMethod = string;
export type PatchCallback<Args extends any[] = any[], Res = any, Self = any> = (ctx: PatchCallbackContext<Args, Res, Self>) => any;

export interface Patch<Args extends any[] = any[], Res = any, Self = any> extends PatchOptions {
	callback: PatchCallback<Args, Res, Self>;
}

export interface PatchOptions {
	once?: boolean;
	caller?: string;
}

export interface PatchCallbackContext<Args extends any[] = any[], Res = any, Self = any> {
	original: (...args: Args) => Res;
	this: Self;
	result: Res | null;
	args: Args;
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

// Helper to detect if a type is `any`
type IsAny<T> = 0 extends (1 & T) ? true : false;

export type PropOf<M> = IsAny<M> extends true
	? string
	: {
		[K in keyof M]: M[K] extends AnyFunction | AnyConstructor ? Extract<K, string> : never
	}[keyof M];