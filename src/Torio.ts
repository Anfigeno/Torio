import type { Client, ClientEvents } from "discord.js";
import registro from "./configuracion/registro";
import { Funci } from "./lib/Funci";

export default class Torio {
	private _caracteristicas: Caracteristica[] = [];

	constructor(public readonly cliente: Client) {}

	public agregarCaracteristicas(...caracteristicas: Caracteristica[]): void {
		this._caracteristicas.push(...caracteristicas);
	}

	public establecerCaracteristicas(): void {
		for (const caracteristica of this._caracteristicas) {
			registro.info(`Cargando caracteristica [${caracteristica.nombre}]`);

			if (caracteristica.manejadoresDeEvento.length === 0) continue;
			for (const manejadorDeEvento of caracteristica.manejadoresDeEvento) {
				this.cliente.on(manejadorDeEvento.evento, (...args) =>
					manejadorDeEvento.despachador(this, ...args),
				);
			}

			registro.info(
				`[${caracteristica.nombre}] cargó ${caracteristica.manejadoresDeEvento.length} manejadores de eventos`,
			);
		}
	}
}

export class Caracteristica {
	private _manejadoresDeEvento: ManejadorDeEvento<any>[] = [];
	public get manejadoresDeEvento(): ManejadorDeEvento<any>[] {
		return this._manejadoresDeEvento;
	}

	constructor(public readonly nombre: string) {}

	public agregarManejadorDeEvento<T extends keyof ClientEvents>(
		manejador: ManejadorDeEvento<T>,
	): void {
		this._manejadoresDeEvento.push(manejador);
	}
}

export class ManejadorDeEvento<T extends keyof ClientEvents> {
	constructor(
		public readonly evento: T,
		public readonly despachador: (
			ctx: Torio,
			...args: ClientEvents[T]
		) => void | Promise<void>,
	) {}

	public static ErrorResponderMensaje =
		class ErrorResponderMensaje extends Funci.ErrorBase {};
}
