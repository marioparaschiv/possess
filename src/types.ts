import type { PatchType } from './patcher';


export interface PatchedModule {
	parent: WeakRef<PatchParent>;
	method: PatchMethod;
	original: AnyFunction & AnyConstructor;
	patches: Record<PatchType, Set<Patch<any, any, any>>>;
}

export type PatchParent = AnyFunction | AnyObject;
export type PatchMethod = string;

// Use method signature for bivariant parameters (allows both PatchContext<any[]> and PatchContext<[specific]>)
export interface PatchCallback<Args extends any[] = any[], Res = any, Self = any> {
	(ctx: PatchContext<Args, Res, Self>): any;
}

export interface Patch<Args extends any[] = any[], Res = any, Self = any> extends PatchOptions {
	callback: PatchCallback<Args, Res, Self>;
}

export interface PatchOptions {
	once?: boolean;
	caller?: string;
}

export interface PatchContext<Args extends any = any[], Res = any, Self = any> {
	original: (...args: any[]) => Res;
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