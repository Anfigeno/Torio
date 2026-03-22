import { Events } from "discord.js";
import registro from "@/configuracion/registro";
import { ErrorBase, intentar, usando } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";

export default usando(new Caracteristica("Ping"), c => {
	c.agregarManejadorDeEvento(Events.MessageCreate, async mensaje => {
		if (mensaje.author.bot || mensaje.content !== "!ping") return;

		const latencia = Date.now() - mensaje.createdTimestamp;

		const { ok: seEnvioElMensaje, error } = await intentar({
			accion: () => mensaje.reply(`Pong! ${latencia}ms`),
			atrapar: e =>
				new ErrorAlEjecutarPing({
					mensaje: "No se pudo responder",
					errorBase: e,
				}),
		});

		if (!seEnvioElMensaje) registro.error(error);
	});
});

class ErrorAlEjecutarPing extends ErrorBase {}
