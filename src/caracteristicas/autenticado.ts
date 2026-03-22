import { Events } from "discord.js";
import registro from "@/configuracion/registro";
import { usando } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";

export default usando(new Caracteristica("Autenticado"), c =>
	c.agregarManejadorDeEvento(Events.ClientReady, cliente => registro.info(`Bot eutenticado como ${cliente.user.username}`)),
);
