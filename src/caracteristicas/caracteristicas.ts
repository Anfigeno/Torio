import type { Client } from "discord.js";
import { Funci } from "@/lib/Funci";
import establecerCaracteristicaPing from "./ping";
import establecerCaracteristicaAutenticado from "./preparado";
import establecerCaracteristicaRegistrosDeCanalesDeTexto from "./registrosDeDiscord/registrosDeCanalesDeTexto";
import establecerCaracteristicaDeRegistrosDeCanalesDeVoz from "./registrosDeDiscord/registrosDeCanalesDeVoz";
import establecerCaracteristicaDeRegistrosDeServidor from "./registrosDeDiscord/registrosDeServidor";
import establecerCaracteristicaSaludo from "./saludo";

export default function establecerCaracteristicas(cliente: Client) {
	Funci.pipa(cliente).tubo(
		establecerCaracteristicaAutenticado,
		establecerCaracteristicaPing,
		establecerCaracteristicaSaludo,
		establecerCaracteristicaRegistrosDeCanalesDeTexto,
		establecerCaracteristicaDeRegistrosDeCanalesDeVoz,
		establecerCaracteristicaDeRegistrosDeServidor,
	);
}
