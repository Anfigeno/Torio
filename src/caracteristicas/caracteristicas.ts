import type { Client } from "discord.js";
import { Funci } from "@/lib/Funci";
import establecerCaracteristicaPing from "./ping";
import establecerCaracteristicaPreparado from "./preparado";
import establecerCaracteristicaSaludo from "./saludo";

export default function establecerCaracteristicas(cliente: Client) {
	Funci.pipa(cliente).tubo(
		establecerCaracteristicaPreparado,
		establecerCaracteristicaPing,
		establecerCaracteristicaSaludo,
	);
}
