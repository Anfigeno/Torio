import type { Client } from "discord.js";
import { Funci } from "@/lib/Funci";
import establecerCaracteristicaPing from "./ping";
import establecerCaracteristicaPreparado from "./preparado";
import establecerCaracteristicaRegistrosDeCanalesDeTexto from "./registrosDeDiscord/registrosDeCanalesDeTexto";
import establecerCaracteristicaDeRegistrosDeCanalesDeVoz from "./registrosDeDiscord/registrosDeCanalesDeVoz";
import establecerCaracteristicaSaludo from "./saludo";
import establecerCaracteristicaDeRegistrosDeServidor from "./registrosDeDiscord/registrosDeServidor";

export default function establecerCaracteristicas(cliente: Client) {
	Funci.pipa(cliente).tubo(
		establecerCaracteristicaPreparado,
		establecerCaracteristicaPing,
		establecerCaracteristicaSaludo,
		establecerCaracteristicaRegistrosDeCanalesDeTexto,
		establecerCaracteristicaDeRegistrosDeCanalesDeVoz,
		establecerCaracteristicaDeRegistrosDeServidor,
	);
}
