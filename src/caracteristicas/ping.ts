import { Events } from "discord.js";
import registro from "@/configuracion/registro";
import { Funci } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";

const ping = Funci.usando(new Caracteristica("Ping"), (c) => {
	c.agregarManejadorDeEvento(Events.MessageCreate, async (mensaje) => {
		if (mensaje.author.bot || mensaje.content !== "!ping") return;

		const latencia = Date.now() - mensaje.createdTimestamp;

		const { ok: seEnvioElMensaje, error } = await Funci.intentar({
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

class ErrorAlResponderPing extends Funci.ErrorBase {}
