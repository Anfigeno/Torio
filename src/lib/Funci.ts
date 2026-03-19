export namespace Funci {
	type Anonima<T, K> = (valor: T) => K;

	export function pipa<A, B>(valor: A, fn: Anonima<A, B>): B;
	export function pipa<A, B, C>(valor: A, fn1: Anonima<A, B>, fn2: Anonima<B, C>): C;
	export function pipa<A, B, C, D>(valor: A, fn1: Anonima<A, B>, fn2: Anonima<B, C>, fn3: Anonima<C, D>): D;
	export function pipa<A, B, C, D, E>(
		valor: A,
		fn1: Anonima<A, B>,
		fn2: Anonima<B, C>,
		fn3: Anonima<C, D>,
		fn4: Anonima<D, E>,
	): E;
	export function pipa<A, B, C, D, E, F>(
		valor: A,
		fn1: Anonima<A, B>,
		fn2: Anonima<B, C>,
		fn3: Anonima<C, D>,
		fn4: Anonima<D, E>,
		fn5: Anonima<E, F>,
	): F;
	export function pipa<A, B, C, D, E, F, G>(
		valor: A,
		fn1: Anonima<A, B>,
		fn2: Anonima<B, C>,
		fn3: Anonima<C, D>,
		fn4: Anonima<D, E>,
		fn5: Anonima<E, F>,
		fn6: Anonima<F, G>,
	): G;
	export function pipa<A, B, C, D, E, F, G, H>(
		valor: A,
		fn1: Anonima<A, B>,
		fn2: Anonima<B, C>,
		fn3: Anonima<C, D>,
		fn4: Anonima<D, E>,
		fn5: Anonima<E, F>,
		fn6: Anonima<F, G>,
		fn7: Anonima<G, H>,
	): H;
	export function pipa<A, B, C, D, E, F, G, H, I>(
		valor: A,
		fn1: Anonima<A, B>,
		fn2: Anonima<B, C>,
		fn3: Anonima<C, D>,
		fn4: Anonima<D, E>,
		fn5: Anonima<E, F>,
		fn6: Anonima<F, G>,
		fn7: Anonima<G, H>,
		fn8: Anonima<H, I>,
	): I;
	export function pipa<A, B, C, D, E, F, G, H, I, J>(
		valor: A,
		fn1: Anonima<A, B>,
		fn2: Anonima<B, C>,
		fn3: Anonima<C, D>,
		fn4: Anonima<D, E>,
		fn5: Anonima<E, F>,
		fn6: Anonima<F, G>,
		fn7: Anonima<G, H>,
		fn8: Anonima<H, I>,
		fn9: Anonima<I, J>,
	): J;
	export function pipa<A, B, C, D, E, F, G, H, I, J, K>(
		valor: A,
		fn1: Anonima<A, B>,
		fn2: Anonima<B, C>,
		fn3: Anonima<C, D>,
		fn4: Anonima<D, E>,
		fn5: Anonima<E, F>,
		fn6: Anonima<F, G>,
		fn7: Anonima<G, H>,
		fn8: Anonima<H, I>,
		fn9: Anonima<I, J>,
		fn10: Anonima<H, K>,
	): K;
	export function pipa(valor: unknown, ...fns: Anonima<unknown, unknown>[]): unknown {
		for (const fn of fns) {
			valor = fn(valor);
		}
		return valor;
	}

	// biome-ignore lint/suspicious/noExplicitAny: Pa eso es
	export type Ignorable = any;

	export function usando<T>(valor: T, fn: (v: T) => unknown): T {
		fn(valor);
		return valor;
	}

	export function con<T extends unknown[], R>(...args: [...T, (...args2: T) => R]): R {
		const fn = args.pop() as (...args: T) => R;
		// biome-ignore lint/complexity/noBannedTypes: Sinceramente, no se ni por que esto esta mal
		return (fn as Function)(...args);
	}

	export type Resultado<T, K extends Error> =
		| {
				ok: true;
				valor: T;
				error: null;
		  }
		| {
				ok: false;
				valor: null;
				error: K;
		  };

	export function exito<T>(valor: T): Resultado<T, never> {
		return { ok: true, valor, error: null };
	}

	export function fallo<K extends Error>(error: K): Resultado<never, K> {
		return { ok: false, valor: null, error };
	}

	export async function intentar<T, K extends Error>(cfg: {
		accion: () => Promise<T>;
		atrapar: (error: unknown) => K;
	}): Promise<Resultado<T, K>> {
		try {
			const datos = await cfg.accion();
			return exito(datos);
		} catch (e) {
			return fallo(cfg.atrapar(e));
		}
	}

	export type Quiza<T> = { existe: true; valor: T } | { existe: false; valor: null };

	export function justo<T>(valor: T): Quiza<T> {
		return { existe: true, valor };
	}

	export function nada(): Quiza<never> {
		return { existe: false, valor: null };
	}

	export namespace Objeto {
		type Entradas<T> = {
			[K in keyof T]: [K, T[K]];
		}[keyof T][];

		export function entradas<T extends object>(objeto: T): Entradas<T> {
			return Object.entries(objeto) as Entradas<T>;
		}
	}

	export class ErrorBase extends Error {
		public readonly errorBase: unknown;

		constructor(cfg?: { mensaje?: string; errorBase?: unknown }) {
			super(cfg?.mensaje);

			this.errorBase = cfg?.errorBase;
			this.name = this.constructor.name;
		}
	}
}
