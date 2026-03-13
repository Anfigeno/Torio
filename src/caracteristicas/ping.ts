import type { Client, Message } from "discord.js";
import registro from "@/configuracion/registro";
import { Funci } from "@/lib/Funci";

export default function establecerCaracteristicaPing(cliente: Client): void {
	cliente.on("messageCreate", contestarPing);
}

async function contestarPing(mensaje: Message): Promise<void> {
	if (mensaje.author.bot || mensaje.content !== "!ping") return;

	registro.info(`Contestando !ping a ${mensaje.author.username}`);

	const latencia = Date.now() - mensaje.createdTimestamp;

	const { ok: seEnvioElMensaje, error } = await Funci.intentar({
		accion: () => mensaje.reply(`Pong! ${latencia}ms`),
		atrapar: (e) => new ErrorAlContestarElPing(e),
	});

	if (!seEnvioElMensaje) registro.error(error);
}

class ErrorAlContestarElPing extends Error {
	constructor(public readonly errorBase?: unknown) {
		super();
		this.name = "ErrorAlContestarElPing";
	}
}
