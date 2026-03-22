import {
	Client,
	type ClientEvents,
	REST,
	Routes,
	type SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import registro from "../configuracion/registro";
import { ErrorBase, exito, fallo, type Ignorable, intentar, justo, nada, type Quiza, type Resultado } from "./Funci";

export default class Torio {
	private readonly rest: REST;
	private _cliente: Client;

	constructor(
		public readonly claveDelBot: string,
		public readonly idDelBot: string,
		public readonly idDelServidor: string,
	) {
		this._cliente = new Client({ intents: [] });
		this.rest = new REST({ version: "10" }).setToken(claveDelBot);
	}

	public get cliente(): Client {
		return this._cliente;
	}

	public establecerCliente(cliente: Client): void {
		this._cliente = cliente;
	}

	public async iniciar(): Promise<Resultado<never, ErrorBase>> {
		const { ok: seInicioElCliente, error: errorAlIniciarElCliente } = await intentar({
			accion: () => this._cliente.login(this.claveDelBot),
			atrapar: e => new ErrorBase({ mensaje: "No se pudo iniciar el cliente", errorBase: e }),
		});

		if (!seInicioElCliente) return fallo(errorAlIniciarElCliente);

		return exito();
	}

	private _caracteristicas: Quiza<Caracteristica[]> = nada();

	public agregarCaracteristicas(...caracteristicas: Caracteristica[]): void {
		if (!this._caracteristicas.existe) {
			this._caracteristicas = justo(caracteristicas);
			return;
		}

		this._caracteristicas.valor.push(...caracteristicas);
	}

	public establecerCaracteristicas(): Resultado<never, ErrorBase> {
		const { existe: hayCaracteristicas, valor: caracteristicas } = this._caracteristicas;
		if (!hayCaracteristicas) return fallo(new ErrorBase({ mensaje: "No hay caracteristicas" }));

		this.establecerManejadoresDeEventos(caracteristicas);
		this.establecerComandos(caracteristicas);

		return exito();
	}

	private establecerManejadoresDeEventos(caracteristicas: Caracteristica[]): void {
		let manejadoresDeEventosCargados = 0;

		for (const caracteristica of caracteristicas) {
			const { existe: hayManejadoresDeEvento, valor: manejadoresDeEvento } = caracteristica.manejadoresDeEvento;

			if (!hayManejadoresDeEvento) continue;

			manejadoresDeEventosCargados += manejadoresDeEvento.length;

			for (const manejadorDeEvento of manejadoresDeEvento) {
				this._cliente.on(manejadorDeEvento.evento, manejadorDeEvento.despachador);
			}

			registro.info(`[${caracteristica.nombre}] cargó ${manejadoresDeEvento.length} manejadores de eventos`);
		}

		if (manejadoresDeEventosCargados === 0) {
			registro.info("No se cargaron manejadores de eventos");
			return;
		}

		registro.info(`Se cargaron ${manejadoresDeEventosCargados} manejadores de evento en total`);
	}

	private async establecerComandos(caracteristicas: Caracteristica[]): Promise<void> {
		let comandosRegistrados = 0;

		for (const { comandos: quizaComandos, nombre } of caracteristicas) {
			const { existe: hayComandos, valor: comandos } = quizaComandos;

			if (!hayComandos) continue;

			comandosRegistrados += comandos.length;

			const { ok: seRegistraronLosComandos, error: errorAlRegistrarComandos } = await intentar({
				accion: () =>
					this.rest.put(Routes.applicationGuildCommands(this.idDelBot, this.idDelServidor), {
						body: comandos,
					}),
				atrapar: e => new ErrorBase({ mensaje: `No se pudieron registrar los comandos de [${nombre}]`, errorBase: e }),
			});

			if (!seRegistraronLosComandos) {
				registro.error(errorAlRegistrarComandos);
				return;
			}

			registro.info(`[${nombre}] registró ${comandos.length} comandos`);
		}

		if (comandosRegistrados === 0) {
			registro.info("No se registroaron comandos");
			return;
		}

		registro.info(`Se registraron ${comandosRegistrados} comandos en total`);
	}
}

export class Caracteristica {
	private _manejadoresDeEvento: Quiza<ManejadorDeEvento<Ignorable>[]> = nada();
	public get manejadoresDeEvento(): Quiza<ManejadorDeEvento<Ignorable>[]> {
		return this._manejadoresDeEvento;
	}

	private _comandos: Quiza<(SlashCommandBuilder | SlashCommandOptionsOnlyBuilder)[]> = nada();
	public get comandos(): Quiza<(SlashCommandBuilder | SlashCommandOptionsOnlyBuilder)[]> {
		return this._comandos;
	}

	constructor(public readonly nombre: string) {}

	public agregarManejadorDeEvento<T extends keyof ClientEvents>(
		evento: T,
		despachador: (...args: ClientEvents[T]) => void,
	): void {
		if (!this._manejadoresDeEvento.existe) {
			this._manejadoresDeEvento = justo([{ evento, despachador }]);
			return;
		}

		this._manejadoresDeEvento.valor.push({ evento, despachador });
	}

	public agregarComando(comando: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder): void {
		if (!this._comandos.existe) {
			this._comandos = justo([comando]);
			return;
		}

		this._comandos.valor.push(comando);
	}
}

export type ManejadorDeEvento<T extends keyof ClientEvents> = {
	evento: T;
	despachador: (...args: ClientEvents[T]) => void;
};
