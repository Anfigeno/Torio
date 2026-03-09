import { Funci } from "./Funci";

export default class Cachos<T> {
	private _valor: T | null = null;
	private actualizar: null | (() => Promise<Funci.Resultado<T>>) = null;
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

	public get valor(): T | null {
		return this._valor;
	}

	public establecerActualizador(actualizador: () => Promise<Funci.Resultado<T>>) {
		this.actualizar = actualizador;
	}

	public enFallo(fn: (error: Error, ctx: this) => void) {
		this.alFallar = fn;
	}

	public enActualizacion(fn: (ctx: this) => void): void {
		this.alActualizar = fn;
	}

	public iniciar(): Funci.Resultado<null> {
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
		actualizador: () => Promise<Funci.Resultado<T>>,
	): Promise<void> {
		const alActualizar = this.alActualizar || (() => null);
		alActualizar(this);

		const resultado = await actualizador();
		if (!resultado.ok) {
			if (this.alFallar !== undefined) this.alFallar(resultado.error, this);
			return;
		}

		this._valor = resultado.valor;
	}

	public detener(): Funci.Resultado<null> {
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
