import type { ContainerBuilder, GuildTextBasedChannel } from "discord.js";
import type { ErrorAlObtenerCanal } from "@/caches";
import registro from "@/configuracion/registro";
import type Cachos from "@/lib/Cachos";
import { Funci } from "@/lib/Funci";

export async function enviarRegistro(
	resumenDeRegistro: ContainerBuilder,
	canalDeRegistros: Cachos<GuildTextBasedChannel, ErrorAlObtenerCanal>,
) {
	const { ok: canalObtenido, valor: canal, error } = canalDeRegistros.obtenerValor();
	if (!canalObtenido) {
		registro.error(error);
		return;
	}

	const { ok: registroEnviado, error: error2 } = await Funci.intentar({
		accion: () =>
			canal.send({
				flags: ["IsComponentsV2"],
				components: [resumenDeRegistro],
				allowedMentions: { users: [] },
			}),
		atrapar: (e) => new ErrorAlEnviarRegistro(e),
	});

	if (!registroEnviado) registro.error(error2);
}

class ErrorAlEnviarRegistro extends Error {
	constructor(public readonly errorBase?: unknown) {
		super();
		this.name = "ErrorAlEnviarRegistro";
	}
}
