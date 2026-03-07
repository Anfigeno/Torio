import { type Client, Events } from "discord.js";
import registro from "@/configuracion/registro";

export default function establecerCaracteristicaPreparado(cliente: Client) {
	cliente.on(Events.ClientReady, registrarBotListo);
}

function registrarBotListo(cliente: Client) {
	registro.info(`¡Bot listo como ${cliente.user?.username}!`);
}
