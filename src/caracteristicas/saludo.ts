import { Events } from "discord.js";
import registro from "@/configuracion/registro";
import { ErrorBase, intentar, usando } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";

const saludo = usando(new Caracteristica("Saludo"), (c) => {
	const SALUDOS = ["Hola", "ola", "oa"];
	const RESPUESTAS_A_SALUDOS = ["Hola, causa", "oa", "Ahorita no", "¡Hola!", "no"];

	c.agregarManejadorDeEvento(Events.MessageCreate, async (mensaje) => {
		const autorEsBot = mensaje.author.bot;
		const mensajeEsSaludo = SALUDOS.some((saludo) => mensaje.content.includes(saludo));
		if (autorEsBot || !mensajeEsSaludo) return;

		const saludo =
			// biome-ignore lint/style/noNonNullAssertion: Esta controlado
			RESPUESTAS_A_SALUDOS[Math.floor(Math.random() * RESPUESTAS_A_SALUDOS.length)]!;

		const { ok: seEnvioElMensaje, error } = await intentar({
			accion: () => mensaje.reply(saludo),
			atrapar: (e) =>
				new ErrorAlResponderPing({
					mensaje: "No se pudo contestar a un saludo",
					errorBase: e,
				}),
		});

		if (!seEnvioElMensaje) registro.error(error);
	});
});

export default saludo;

class ErrorAlResponderPing extends ErrorBase {}
