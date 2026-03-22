// biome-ignore lint/suspicious/noExplicitAny: Pa eso es
export type Ignorable = any;

export type Anonima<T, K> = (valor: T) => K;

export function pipa<A, B>(valor: A, fn: Anonima<A, B>): B;
export function pipa<A, B, C>(valor: A, fn1: Anonima<A, B>, fn2: Anonima<B, C>): C;
export function pipa<A, B, C, D>(valor: A, fn1: Anonima<A, B>, fn2: Anonima<B, C>, fn3: Anonima<C, D>): D;
export function pipa<A, B, C, D, E>(valor: A, fn1: Anonima<A, B>, fn2: Anonima<B, C>, fn3: Anonima<C, D>, fn4: Anonima<D, E>): E;
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

export function exito<T = undefined>(valor?: T): Resultado<T, never> {
	return { ok: true, valor: valor as T, error: null };
}

export function fallo<K extends Error>(error: K): Resultado<never, K> {
	return { ok: false, valor: null, error };
}

export type Quiza<T> = { existe: true; valor: T } | { existe: false; valor: null };

export function justo<T>(valor: T): Quiza<T> {
	return { existe: true, valor };
}

export function nada(): Quiza<never> {
	return { existe: false, valor: null };
}

export function map<T, K>(fn: (valor: T) => K) {
	return (quizaValor: Quiza<T>) => {
		if (quizaValor.existe) return pipa(quizaValor.valor, fn, existe);
		return quizaValor;
	};
}

export function existe<T>(valor: T | null | undefined): Quiza<NonNullable<T>> {
	if (valor === undefined || valor === null) return nada();
	if (Array.isArray(valor) && valor.length === 0) return nada();
	return justo(valor as NonNullable<T>);
}

type CfgIntentar<T, K> = { accion: () => T; atrapar: (error: unknown) => K; finalmente?: (error: K) => unknown };

export function intentar<T, K extends Error>(cfg: CfgIntentar<Promise<T>, K>): Promise<Resultado<T, K>>;
export function intentar<T, K extends Error>(cfg: CfgIntentar<T, K>): Resultado<T, K>;
export function intentar<T, K extends Error>(cfg: CfgIntentar<T | Promise<T>, K>): Resultado<T, K> | Promise<Resultado<T, K>> {
	try {
		const datos = cfg.accion();
		if (datos instanceof Promise) {
			return datos.then(exito).catch(e => {
				const errorFinal = cfg.atrapar(e);

				if (cfg.finalmente !== undefined) cfg.finalmente(errorFinal);

				return fallo(errorFinal);
			});
		}
		return exito(datos);
	} catch (e) {
		const errorFinal = cfg.atrapar(e);
		if (cfg.finalmente !== undefined) cfg.finalmente(errorFinal);
		return fallo(errorFinal);
	}
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

export namespace Arreglos {
	export function map<T, K>(fn: (valor: T, indice: number) => K): (arreglo: T[]) => K[] {
		return (arreglo: T[]) => {
			const arregloFinal: K[] = [];

			for (let i = 0; i < arreglo.length; i++) {
				const valor = arreglo[i] as T;
				arregloFinal.push(fn(valor, i));
			}

			return arregloFinal;
		};
	}

	export function iterar<T>(fn: (valor: T, indice: number) => void): (arreglo: T[]) => void {
		return (arreglo: T[]) => {
			for (let i = 0; i < arreglo.length; i++) {
				const valor = arreglo[i] as T;
				fn(valor, i);
			}
		};
	}

	export function reducir<T, K>(valorInicial: K, fn: (acc: K, valor: T, indice: number) => K): (arreglo: T[]) => K {
		return (arreglo: T[]) => {
			let acumulador = valorInicial;

			pipa(
				arreglo,
				Arreglos.iterar((valor, i) => {
					acumulador = fn(acumulador, valor, i);
				}),
			);

			return acumulador;
		};
	}

	export function filtrar<T, K extends T>(fn: (valor: T) => valor is K) {
		return (arreglo: T[]) => {
			const arregloFinal: K[] = [];

			for (const valor of arreglo) {
				if (fn(valor)) arregloFinal.push(valor);
			}

			return arregloFinal;
		};
	}

	export type Anidado<T> = (T | Anidado<T>)[];

	export function aplanar<T>(arreglo: Anidado<T>): T[] {
		const arregloFinal: T[] = [];

		for (const valor of arreglo) {
			if (Array.isArray(valor)) {
				arregloFinal.push(...aplanar(valor));
				continue;
			}

			arregloFinal.push(valor);
		}

		return arregloFinal;
	}

	/**
	 * @deprecated Usar `Funci.existe` en su lugar
	 */
	export function existe<T>(arreglo: T[]): Quiza<T[]> {
		if (arreglo.length === 0) return nada();
		return justo(arreglo);
	}
}
