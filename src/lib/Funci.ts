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

	export type Resultado<T> =
		| {
				ok: true;
				valor: T;
		  }
		| {
				ok: false;
				error: Error;
		  };

	export function exito<T>(valor: T): Resultado<T> {
		return { ok: true, valor };
	}

	export function fallo<T>(error: Error): Resultado<T> {
		return { ok: false, error };
	}

	export async function atrapar<T>(
		funcionAsincronaQuePuedeFallar: () => Promise<T>,
	): Promise<Resultado<T>> {
		try {
			const datos = await funcionAsincronaQuePuedeFallar();
			return exito(datos);
		} catch (e) {
			return fallo(e as Error);
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
}
