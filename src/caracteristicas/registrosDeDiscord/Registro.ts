import { ContainerBuilder, type GuildTextBasedChannel, TextDisplayBuilder } from "discord.js";
import type { ErrorAlObtenerCanal } from "@/caches";
import registro from "@/configuracion/registro";
import type Cachos from "@/lib/Cachos";
import { Funci } from "@/lib/Funci";

export abstract class Registro {
	protected abstract canalDeRegistros: Cachos<GuildTextBasedChannel, ErrorAlObtenerCanal>;

	protected abstract asignarEventos(): Funci.Resultado<string[] | null, ErrorAlAsignarEventos>;

	private crearResumen(): Funci.Resultado<ContainerBuilder | null, ErrorAlCrearResumen> {
		const { ok: eventosAsignados, valor: eventos, error } = this.asignarEventos();
		if (!eventosAsignados) return Funci.fallo(new ErrorAlCrearResumen({ errorBase: error }));

		if (!eventos || eventos.length === 0) return Funci.exito(null);

		const resumen = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(eventos.join("\n\n")),
		);

		return Funci.exito(resumen);
	}

	public async registrar(): Promise<void> {
		const { ok: canalObtenido, valor: canal, error: errorAlObtenerElCanal } = this.canalDeRegistros.obtenerValor();
		if (!canalObtenido) {
			registro.error(errorAlObtenerElCanal);
			return;
		}

		const { ok: resumenCreado, valor: resumen, error: errorAlCrearElResumen } = this.crearResumen();
		if (!resumenCreado) {
			registro.error(errorAlCrearElResumen);
			return;
		}

		if (!resumen) return;

		const { ok: registroEnviado, error: errorAlEnviarElRegistro } = await Funci.intentar({
			accion: () =>
				canal.send({
					flags: ["IsComponentsV2"],
					components: [resumen],
					allowedMentions: { users: [] },
				}),
			atrapar: (e) => new ErrorAlEnviarRegistro({ errorBase: e }),
		});

		if (!registroEnviado) registro.error(errorAlEnviarElRegistro);
	}
}

export class ErrorAlCrearResumen extends Funci.ErrorBase {}
export class ErrorAlEnviarRegistro extends Funci.ErrorBase {}
export class ErrorAlAsignarEventos extends Funci.ErrorBase {}
export class SinEventosQueAsignar extends Funci.ErrorBase {}
