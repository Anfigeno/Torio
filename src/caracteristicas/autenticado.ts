import { Events } from "discord.js";
import registro from "@/configuracion/registro";
import { Funci } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";

export const autenticado = Funci.usando(new Caracteristica("Autenticado"), (c) => {
	c.agregarManejadorDeEvento(Events.ClientReady, (cliente) => {
		registro.info(`Bot eutenticado como ${cliente.user.username}`);
	});
});

export default autenticado;
