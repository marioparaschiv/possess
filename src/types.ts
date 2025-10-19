import type { PatchType } from './patcher';


export interface PatchedModule {
	parent: WeakRef<PatchParent>;
	method: PatchMethod;
	original: AnyFunction & AnyConstructor;
	patches: {
		[PatchType.Before]: Set<Patch<any, any, any>>,
		[PatchType.Instead]: Set<Patch<any, any, any>>,
		[PatchType.After]: Set<Patch<any, any, any>>;
	};
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
export type PropOf<M> = {
	[K in keyof M]: M[K] extends AnyFunction | AnyConstructor ? Extract<K, string> : never
}[keyof M];