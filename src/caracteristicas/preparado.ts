import { type Client, Events } from "discord.js";
import registro from "@/configuracion/registro";

export default function establecerCaracteristicaAutenticado(cliente: Client) {
	cliente.on(Events.ClientReady, registrarBotListo);
}

function registrarBotListo(cliente: Client) {
	registro.info(`Bot autenticado como ${cliente.user?.username}`);
}
