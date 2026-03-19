import { ContainerBuilder, type GuildTextBasedChannel, TextDisplayBuilder } from "discord.js";
import type { ErrorAlObtenerCanal } from "@/caches";
import registro from "@/configuracion/registro";
import type Cachos from "@/lib/Cachos";
import { Funci } from "@/lib/Funci";

export abstract class Registro {
	protected abstract canalDeRegistros: Cachos<GuildTextBasedChannel, ErrorAlObtenerCanal>;

	protected abstract asignarEventos(): Funci.Resultado<Funci.Quiza<string[]>, ErrorAlAsignarEventos>;

	private crearResumen(): Funci.Resultado<Funci.Quiza<ContainerBuilder>, ErrorAlCrearResumen> {
		const { ok: eventosAsignados, valor: quizaEventos, error } = this.asignarEventos();
		if (!eventosAsignados) return Funci.fallo(new ErrorAlCrearResumen({ errorBase: error }));

		const { existe: existenLosEventos, valor: eventos } = quizaEventos;
		if (!existenLosEventos) return Funci.exito(Funci.nada());

		const resumen = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(eventos.join("\n\n")));

		return Funci.exito(Funci.justo(resumen));
	}

	public async registrar(): Promise<void> {
		const { ok: canalObtenido, valor: canal, error: errorAlObtenerElCanal } = this.canalDeRegistros.obtenerValor();
		if (!canalObtenido) {
			registro.error(errorAlObtenerElCanal);
			return;
		}

		const { ok: resumenCreado, valor: quizaResumen, error: errorAlCrearElResumen } = this.crearResumen();
		if (!resumenCreado) {
			registro.error(errorAlCrearElResumen);
			return;
		}

		const { existe: existeElResumen, valor: resumen } = quizaResumen;
		if (!existeElResumen) return;

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
