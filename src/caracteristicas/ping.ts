import registro from "@/configuracion/registro";
import { Funci } from "@/lib/Funci";
import { Caracteristica, ManejadorDeEvento } from "@/Torio";

const ping = new Caracteristica("Ping");

ping.agregarManejadorDeEvento(
	new ManejadorDeEvento("messageCreate", async (_, mensaje) => {
		if (mensaje.author.bot || mensaje.content !== "!ping") return;

		const latencia = Date.now() - mensaje.createdTimestamp;

		const { ok: seEnvioElMensaje, error } = await Funci.intentar({
			accion: () => mensaje.reply(`Pong! ${latencia}ms`),
			atrapar: (e) =>
				new ManejadorDeEvento.ErrorResponderMensaje({
					mensaje: "No se pudo responder un ping",
					errorBase: e,
				}),
		});

		if (!seEnvioElMensaje) registro.error(error);
	}),
);

export default ping;
