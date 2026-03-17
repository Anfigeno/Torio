import type { Client, ClientEvents } from "discord.js";
import registro from "../configuracion/registro";
import type { Funci } from "./Funci";

export default class Torio {
	constructor(public readonly cliente: Client) {}

	private _caracteristicas: Caracteristica[] = [];

	public agregarCaracteristicas(...caracteristicas: Caracteristica[]): void {
		this._caracteristicas.push(...caracteristicas);
	}

	public establecerCaracteristicas(): void {
		for (const caracteristica of this._caracteristicas) {
			registro.info(`Cargando caracteristica [${caracteristica.nombre}]`);

			if (caracteristica.manejadoresDeEvento.length === 0) continue;
			for (const manejadorDeEvento of caracteristica.manejadoresDeEvento) {
				this.cliente.on(manejadorDeEvento.evento, manejadorDeEvento.despachador);
			}

			registro.info(
				`[${caracteristica.nombre}] cargó ${caracteristica.manejadoresDeEvento.length} manejadores de eventos`,
			);
		}

		const manejadoresDeEventosCargados = this._caracteristicas.reduce(
			(acumulador, caracteristica) => caracteristica.manejadoresDeEvento.length + acumulador,
			0,
		);

		registro.info(`Se cargaron ${manejadoresDeEventosCargados} manejadores de evento en total`);
	}
}

export class Caracteristica {
	private _manejadoresDeEvento: ManejadorDeEvento<Funci.Ignorable>[] = [];
	public get manejadoresDeEvento(): ManejadorDeEvento<Funci.Ignorable>[] {
		return this._manejadoresDeEvento;
	}

	constructor(public readonly nombre: string) {}

	public agregarManejadorDeEvento<T extends keyof ClientEvents>(
		evento: T,
		despachador: (...args: ClientEvents[T]) => void,
	): void {
		this._manejadoresDeEvento.push({ evento, despachador });
	}
}

export type ManejadorDeEvento<T extends keyof ClientEvents> = {
	evento: T;
	despachador: (...args: ClientEvents[T]) => void;
};
