import {
	type Client,
	type ClientEvents,
	REST,
	Routes,
	type SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import registro from "../configuracion/registro";
import { Arreglos, ErrorBase, existe, type Ignorable, intentar, justo, nada, pipa, type Quiza } from "./Funci";

export default class Torio {
	private readonly rest: REST;

	constructor(public readonly cliente: Client) {
		this.rest = new REST({ version: "10" }).setToken(process.env.CLAVE_DEL_BOT);
	}

	private _caracteristicas: Caracteristica[] = [];

	public agregarCaracteristicas(...caracteristicas: Caracteristica[]): void {
		this._caracteristicas.push(...caracteristicas);
	}

	public establecerCaracteristicas(): void {
		this.establecerManejadoresDeEventos();
		this.establecerComandos();
	}

	private establecerManejadoresDeEventos(): void {
		for (const caracteristica of this._caracteristicas) {
			registro.info(`Cargando caracteristica [${caracteristica.nombre}]`);

			if (caracteristica.manejadoresDeEvento.length === 0) continue;
			for (const manejadorDeEvento of caracteristica.manejadoresDeEvento) {
				this.cliente.on(manejadorDeEvento.evento, manejadorDeEvento.despachador);
			}

			registro.info(`[${caracteristica.nombre}] cargó ${caracteristica.manejadoresDeEvento.length} manejadores de eventos`);
		}

		const manejadoresDeEventosCargados: number = pipa(
			this._caracteristicas,
			Arreglos.reducir(0, (acc, caracteristica) => acc + caracteristica.manejadoresDeEvento.length),
		);

		registro.info(`Se cargaron ${manejadoresDeEventosCargados} manejadores de evento en total`);
	}

	private async establecerComandos(): Promise<void> {
		const { existe: hayComandos, valor: comandosYNombres } = pipa(
			this._caracteristicas,
			Arreglos.map(({ nombre, comandos }) => (comandos.existe ? { nombre, comandos: comandos.valor } : null)),
			Arreglos.filtrar(c => c !== null),
			existe,
		);

		if (!hayComandos) return;

		const { ok: comandosRegistrados, error } = await intentar({
			accion: () =>
				this.rest.put(Routes.applicationGuildCommands(process.env.ID_DEL_BOT, process.env.ID_DEL_SERVIDOR), {
					body: pipa(
						comandosYNombres,
						Arreglos.map(cn => cn.comandos),
						Arreglos.aplanar,
					),
				}),
			atrapar: e => new ErrorAlRegistrarComando({ errorBase: e }),
		});

		if (!comandosRegistrados) {
			registro.fatal(error);
			return;
		}

		for (const { nombre, comandos } of comandosYNombres) {
			registro.info(`[${nombre}] registró ${comandos.length} comandos`);
		}

		const cantidadTotalDeComandos = pipa(
			comandosYNombres,
			Arreglos.reducir(0, (acc, { comandos }) => acc + comandos.length),
		);

		registro.info(`Se registraron ${cantidadTotalDeComandos} comando${cantidadTotalDeComandos > 1 ? "s" : ""} en total`);
	}
}

export class Caracteristica {
	private _manejadoresDeEvento: ManejadorDeEvento<Ignorable>[] = [];
	public get manejadoresDeEvento(): ManejadorDeEvento<Ignorable>[] {
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
		this._manejadoresDeEvento.push({ evento, despachador });
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

class ErrorAlRegistrarComando extends ErrorBase {}
