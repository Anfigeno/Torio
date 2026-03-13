import { Funci } from "./Funci";

export default class Cachos<T, K extends Error> {
	private _valor: T | null = null;
	private actualizar: null | (() => Promise<Funci.Resultado<T, K>>) = null;
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

	public obtenerValor(): Funci.Resultado<T, ValorNoInicializado> {
		if (this._valor === null) return Funci.fallo(new ValorNoInicializado());
		return Funci.exito(this._valor);
	}

	public establecerActualizador(actualizador: () => Promise<Funci.Resultado<T, K>>) {
		this.actualizar = actualizador;
	}

	public enFallo(fn: (error: Error, ctx: this) => void) {
		this.alFallar = fn;
	}

	public enActualizacion(fn: (ctx: this) => void): void {
		this.alActualizar = fn;
	}

	public async iniciar(): Promise<Funci.Resultado<null, ErrorAlIniciarElTemporizador>> {
		if (this.actualizar === null)
			return Funci.fallo(
				new ErrorAlIniciarElTemporizador("El actualizador no ha sido establecido"),
			);

		const actualizador = this.actualizar;
		this.ejecutarActualizacion(actualizador);

		this.temporizador = setInterval(
			() => this.ejecutarActualizacion(actualizador),
			this.intervalo,
		);

		return Funci.exito(null);
	}

	private async ejecutarActualizacion(
		actualizador: () => Promise<Funci.Resultado<T, ActualizacionFallida>>,
	): Promise<Funci.Resultado<T, ActualizacionFallida>> {
		const alActualizar = this.alActualizar || (() => null);
		alActualizar(this);

		const { ok: actualizacionExitosa, valor, error } = await actualizador();

		if (!actualizacionExitosa) {
			if (this.alFallar !== undefined) this.alFallar(error, this);
			return Funci.fallo(error);
		}

		this._valor = valor;
		return Funci.exito(valor);
	}

	public detener(): Funci.Resultado<null, ErrorAlDetenerElTemporizador> {
		if (this.temporizador === null)
			return Funci.fallo(
				new ErrorAlDetenerElTemporizador("El temporizador no ha sido iniciado"),
			);

		clearInterval(this.temporizador);

		return Funci.exito(null);
	}
}

export class ErrorAlIniciarElTemporizador extends Error {
	constructor(
		mensaje: string,
		public readonly errorBase?: unknown,
	) {
		super(mensaje);
		this.name = "ErrorAlIniciarElTemporizador";
	}
}

export class ErrorAlDetenerElTemporizador extends Error {
	constructor(
		mensaje: string,
		public readonly errorBase?: unknown,
	) {
		super(mensaje);
		this.name = "ErrorAlDetenerElTemporizador";
	}
}

export class ActualizacionFallida extends Error {
	constructor(
		mensaje?: string,
		public readonly errorBase?: unknown,
	) {
		super(mensaje);
		this.name = "ActualizacionFallida";
	}
}

class ValorNoInicializado extends Error {
	constructor(
		mensaje?: string,
		public readonly errorBase?: unknown,
	) {
		super(mensaje);
		this.name = "ValorNoInicializado";
	}
}
