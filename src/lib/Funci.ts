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
}
