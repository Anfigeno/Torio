import type { ContainerBuilder, GuildTextBasedChannel } from "discord.js";
import registro from "@/configuracion/registro";
import type Cachos from "@/lib/Cachos";
import { Funci } from "@/lib/Funci";

export async function enviarRegistro(
	resumenDeRegistro: ContainerBuilder,
	canalDeRegistros: Cachos<GuildTextBasedChannel>,
) {
	const resultadoA = canalDeRegistros.obtenerValor();
	if (!resultadoA.ok) {
		registro.error(resultadoA.error);
		return;
	}

	const canal = resultadoA.valor;

	const resultadoB = await Funci.atrapar(() =>
		canal.send({
			flags: ["IsComponentsV2"],
			components: [resumenDeRegistro],
			allowedMentions: { users: [] },
		}),
	);

	if (!resultadoB.ok) registro.error(resultadoB.error);
}
