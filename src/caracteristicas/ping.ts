import { Events } from "discord.js";
import registro from "@/configuracion/registro";
import { ErrorBase, intentar, usando } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";

const ping = usando(new Caracteristica("Ping"), (c) => {
	c.agregarManejadorDeEvento(Events.MessageCreate, async (mensaje) => {
		if (mensaje.author.bot || mensaje.content !== "!ping") return;

		const latencia = Date.now() - mensaje.createdTimestamp;

		const { ok: seEnvioElMensaje, error } = await intentar({
			accion: () => mensaje.reply(`Pong! ${latencia}ms`),
			atrapar: (e) =>
				new ErrorAlResponderPing({
					mensaje: "No se pudo responder un ping",
					errorBase: e,
				}),
		});

		if (!seEnvioElMensaje) registro.error(error);
	});
});

export default ping;

class ErrorAlResponderPing extends ErrorBase {}
