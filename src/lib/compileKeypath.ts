import { keypathToJSExpression } from './keypathToJSExpression';

let cache = Object.create(null);

export function compileKeypath(keypath: string, cacheKey?: string): (this: object) => any;
export function compileKeypath(
	keypath: string | Array<string>,
	cacheKey: string
): (this: object) => any;
export function compileKeypath(
	keypath: string | Array<string>,
	cacheKey: string = keypath as any
): (this: object) => any {
	return (
		cache[cacheKey] ||
		(cache[cacheKey] = Function(
			`var temp; return ${keypathToJSExpression(keypath, cacheKey)};`
		))
	);
}