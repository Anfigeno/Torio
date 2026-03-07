import type { Client, Message } from "discord.js";
import registro from "@/configuracion/registro";

export default function establecerCaracteristicaPing(cliente: Client) {
	cliente.on("messageCreate", contestarPing);
}

async function contestarPing(mensaje: Message) {
	if (mensaje.author.bot || mensaje.content !== "!ping") return;

	registro.info(`Contestando !ping a ${mensaje.author.username}`);

	const latencia = Date.now() - mensaje.createdTimestamp;
	await mensaje.reply(`Pong! ${latencia}ms`);
}
