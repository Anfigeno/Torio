import registro from "@/configuracion/registro";
import { Funci } from "@/lib/Funci";
import { Caracteristica, ManejadorDeEvento } from "@/Torio";

const saludo = new Caracteristica("Saludo");

const SALUDOS = ["Hola", "ola", "oa"];
const RESPUESTAS_A_SALUDOS = ["Hola, causa", "oa", "Ahorita no", "¡Hola!", "no"];

saludo.agregarManejadorDeEvento(
	new ManejadorDeEvento("messageCreate", async (_, mensaje) => {
		const autorEsBot = mensaje.author.bot;
		const mensajeEsSaludo = SALUDOS.some((saludo) => mensaje.content.includes(saludo));
		if (autorEsBot || !mensajeEsSaludo) return;

		const saludo = RESPUESTAS_A_SALUDOS[
			Math.floor(Math.random() * RESPUESTAS_A_SALUDOS.length)
		] as string;

		const { ok: seEnvioElMensaje, error } = await Funci.intentar({
			accion: () => mensaje.reply(saludo),
			atrapar: (e) =>
				new ManejadorDeEvento.ErrorResponderMensaje({
					mensaje: "No se pudo contestar un saludo",
					errorBase: e,
				}),
		});

		if (!seEnvioElMensaje) registro.error(error);
	}),
);

export default saludo;
