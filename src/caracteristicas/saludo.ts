import type { Client, Message } from "discord.js";
import registro from "@/configuracion/registro";
import { Funci } from "@/lib/Funci";

const SALUDOS = ["Hola", "ola", "oa"];
const RESPUESTAS_A_SALUDOS = ["Hola, causa", "oa", "Ahorita no", "¡Hola!", "no"];

export default function establecerCaracteristicaSaludo(cliente: Client) {
	cliente.on("messageCreate", contestarSaludo);
}

async function contestarSaludo(mensaje: Message) {
	const autorEsBot = mensaje.author.bot;
	const mensajeEsSaludo = SALUDOS.some((saludo) => mensaje.content.includes(saludo));
	if (autorEsBot || !mensajeEsSaludo) return;

	registro.info(`Saludando a ${mensaje.author.username}`);

	const saludo = RESPUESTAS_A_SALUDOS[
		Math.floor(Math.random() * RESPUESTAS_A_SALUDOS.length)
	] as string;

	const { ok: seEnvioElMensaje, error } = await Funci.intentar({
		accion: () => mensaje.reply(saludo),
		atrapar: (e) => new ErrorAlContestarSaludo(e),
	});

	if (!seEnvioElMensaje) registro.error(error);
}

class ErrorAlContestarSaludo extends Error {
	constructor(public readonly errorBase?: unknown) {
		super();
		this.name = "ErrorAlContestarSaludo";
	}
}
