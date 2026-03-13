export namespace Funci {
	export function con<T, K>(valor: T, fn: (v: T) => K): K {
		return fn(valor);
	}

	export interface Pipa<T> {
		(): T;
		tubo: (...fns: ((valor: T) => unknown)[]) => void;
	}

	export function pipa<T>(valor: T): Pipa<T> {
		const obtenerValor = () => valor;
		const tubo: Pipa<T>["tubo"] = (...fns) => {
			for (const fn of fns) {
				fn(valor);
			}
		};

		return Object.assign(obtenerValor, { tubo });
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

		constructor(cfg: { mensaje?: string; errorBase?: unknown }) {
			super(cfg.mensaje);

			this.errorBase = cfg.errorBase;
			this.name = this.constructor.name;
		}
	}
}
