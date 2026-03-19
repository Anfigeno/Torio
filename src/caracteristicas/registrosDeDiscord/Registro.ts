import { ContainerBuilder, type GuildTextBasedChannel, TextDisplayBuilder } from "discord.js";
import type { ErrorAlObtenerCanal } from "@/caches";
import registro from "@/configuracion/registro";
import type Cachos from "@/lib/Cachos";
import { ErrorBase, exito, fallo, intentar, justo, nada, type Quiza, type Resultado } from "@/lib/Funci";

export abstract class Registro {
	protected abstract canalDeRegistros: Cachos<GuildTextBasedChannel, ErrorAlObtenerCanal>;

	protected abstract asignarEventos(): Resultado<Quiza<string[]>, ErrorAlAsignarEventos>;

	private crearResumen(): Resultado<Quiza<ContainerBuilder>, ErrorAlCrearResumen> {
		const { ok: eventosAsignados, valor: quizaEventos, error } = this.asignarEventos();
		if (!eventosAsignados) return fallo(new ErrorAlCrearResumen({ errorBase: error }));

		const { existe: existenLosEventos, valor: eventos } = quizaEventos;
		if (!existenLosEventos) return exito(nada());

		const resumen = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(eventos.join("\n\n")));

		return exito(justo(resumen));
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

		const { ok: registroEnviado, error: errorAlEnviarElRegistro } = await intentar({
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

export class ErrorAlCrearResumen extends ErrorBase {}
export class ErrorAlEnviarRegistro extends ErrorBase {}
export class ErrorAlAsignarEventos extends ErrorBase {}
export class SinEventosQueAsignar extends ErrorBase {}
