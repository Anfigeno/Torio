import { ErrorBase, exito, fallo, type Resultado } from "./Funci";

export default class Cachos<T, K extends Error> {
	private _valor: T | null = null;
	private actualizar: null | (() => Promise<Resultado<T, K>>) = null;
	private intervalo: number;
	private temporizador: NodeJS.Timeout | null = null;
	private alFallar?: (error: Error, ctx: this) => void;
	private alActualizar?: (ctx: this) => void;

	constructor(intervalo: number, valorInicial?: T) {
		if (valorInicial !== undefined) {
			this._valor = valorInicial;
		}

		this.intervalo = intervalo;
	}

	public obtenerValor(): Resultado<T, ValorNoInicializado> {
		if (this._valor === null) return fallo(new ValorNoInicializado());
		return exito(this._valor);
	}

	public establecerActualizador(actualizador: () => Promise<Resultado<T, K>>) {
		this.actualizar = actualizador;
	}

	public enFallo(fn: (error: Error, ctx: this) => void) {
		this.alFallar = fn;
	}

	public enActualizacion(fn: (ctx: this) => void): void {
		this.alActualizar = fn;
	}

	public async iniciar(): Promise<Resultado<null, ErrorAlIniciarElTemporizador>> {
		if (this.actualizar === null)
			return fallo(
				new ErrorAlIniciarElTemporizador({
					mensaje: "El actualizador no ha sido establecido",
				}),
			);

		const actualizador = this.actualizar;
		this.ejecutarActualizacion(actualizador);

		this.temporizador = setInterval(() => this.ejecutarActualizacion(actualizador), this.intervalo);

		return exito(null);
	}

	private async ejecutarActualizacion(actualizador: () => Promise<Resultado<T, K>>): Promise<Resultado<T, K>> {
		const alActualizar = this.alActualizar || (() => null);
		alActualizar(this);

		const { ok: actualizacionExitosa, valor, error } = await actualizador();

		if (!actualizacionExitosa) {
			if (this.alFallar !== undefined) this.alFallar(error, this);
			return fallo(error);
		}

		this._valor = valor;
		return exito(valor);
	}

	public detener(): Resultado<null, ErrorAlDetenerElTemporizador> {
		if (this.temporizador === null)
			return fallo(
				new ErrorAlDetenerElTemporizador({
					mensaje: "El temporizador no ha sido iniciado",
				}),
			);

		clearInterval(this.temporizador);

		return exito(null);
	}
}

export class ErrorAlIniciarElTemporizador extends ErrorBase {}
export class ErrorAlDetenerElTemporizador extends ErrorBase {}
export class ActualizacionFallida extends ErrorBase {}
export class ValorNoInicializado extends ErrorBase {}
