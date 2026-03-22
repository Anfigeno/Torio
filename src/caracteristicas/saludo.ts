import { Events } from "discord.js";
import registro from "@/configuracion/registro";
import { Arreglos, con, ErrorBase, intentar, pipa, usando } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";

export default usando(new Caracteristica("Saludo"), c => {
	const SALUDOS = ["Hola", "ola", "oa"];
	const RESPUESTAS_A_SALUDOS = ["Hola, causa", "oa", "Ahorita no", "¡Hola!", "no"];

	c.agregarManejadorDeEvento(Events.MessageCreate, async mensaje => {
		if (mensaje.author.bot) return;

		const haySaludo = pipa(
			SALUDOS,
			Arreglos.algun(saludo =>
				con(mensaje.content.toLowerCase(), contenido => {
					return contenido === saludo || contenido.includes(`${saludo} `) || contenido.includes(` ${saludo} `);
				}),
			),
		);

		if (!haySaludo) return;

		// biome-ignore lint/style/noNonNullAssertion: Esta controlado
		const saludoAResponder = pipa(
			RESPUESTAS_A_SALUDOS.length,
			n => n * Math.random(),
			Math.floor,
			n => RESPUESTAS_A_SALUDOS[n],
		)!;

		const { ok: seEnvioElMensaje, error } = await intentar({
			accion: () => mensaje.reply(saludoAResponder),
			atrapar: e =>
				new ErrorAlEjecutarSaludo({
					mensaje: "No se pudo contestar",
					errorBase: e,
				}),
		});

		if (!seEnvioElMensaje) registro.error(error);
	});
});

class ErrorAlEjecutarSaludo extends ErrorBase {}
