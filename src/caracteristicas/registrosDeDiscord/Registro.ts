import { ContainerBuilder, type GuildTextBasedChannel, TextDisplayBuilder } from "discord.js";
import type { ErrorAlObtenerCanal } from "@/caches";
import registro from "@/configuracion/registro";
import type Cachos from "@/lib/Cachos";
import { ErrorBase, exito, fallo, intentar, justo, nada, pipa, type Quiza, type Resultado } from "@/lib/Funci";

export abstract class Registro {
	protected abstract canalDeRegistros: Cachos<GuildTextBasedChannel, ErrorAlObtenerCanal>;

	protected abstract asignarEventos(): Resultado<Quiza<string[]>, ErrorAlAsignarEventos>;

	private crearResumen(): Resultado<Quiza<ContainerBuilder>, ErrorAlCrearRegistro> {
		const { ok: eventosAsignados, valor: quizaEventos, error: errorAlAsignarEventos } = this.asignarEventos();

		if (!eventosAsignados) return fallo(new ErrorAlCrearRegistro({ errorBase: errorAlAsignarEventos }));

		const { existe: existenLosEventos, valor: eventos } = quizaEventos;
		if (!existenLosEventos) return exito(nada());

		if (eventos.length === 0) return exito(nada());

		const resumen = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(eventos.join("\n\n")));

		return pipa(resumen, justo, exito);
	}

	public async registrar(): Promise<void> {
		const { ok: canalObtenido, valor: canal, error: errorAlObtenerElCanal } = this.canalDeRegistros.obtenerValor();
		if (!canalObtenido) {
			registro.error(new ErrorAlCrearRegistro({ errorBase: errorAlObtenerElCanal }));
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
			atrapar: e => new ErrorAlCrearRegistro({ errorBase: e }),
		});

		if (!registroEnviado) registro.error(errorAlEnviarElRegistro);
	}
}

export class ErrorAlCrearRegistro extends ErrorBase {}
export class ErrorAlAsignarEventos extends ErrorBase {}
