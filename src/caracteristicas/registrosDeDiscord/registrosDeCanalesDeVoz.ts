import { channelMention, Events, type VoiceState } from "discord.js";
import { canalDeRegistrosDeCanalesDeVoz } from "@/caches";
import { con, existe, exito, fallo, justo, pipa, type Quiza, type Resultado, usando } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";
import { ErrorAlAsignarEventos, Registro } from "./Registro";

export default usando(new Caracteristica("Registros de canales de voz"), c =>
	c.agregarManejadorDeEvento(Events.VoiceStateUpdate, (...args) => new CambioDeEstado(...args).registrar()),
);

abstract class RegistroDeCanalesDeVoz extends Registro {
	protected override canalDeRegistros = canalDeRegistrosDeCanalesDeVoz;
}

class CambioDeEstado extends RegistroDeCanalesDeVoz {
	constructor(
		private readonly estadoAnterior: VoiceState,
		private readonly estadoNuevo: VoiceState,
	) {
		super();
	}

	protected override asignarEventos(): Resultado<Quiza<string[]>, ErrorAlAsignarEventos> {
		const usuario = this.estadoNuevo.member?.user || this.estadoAnterior.member?.user;

		if (!usuario) return fallo(new ErrorAlAsignarEventos({ mensaje: "No se encontró el usuario" }));

		const eventos: string[] = [];

		con(existe(this.estadoAnterior.channelId), existe(this.estadoNuevo.channelId), (idDeCanalAnterior, idDeCanalNuevo) => {
			if (!idDeCanalAnterior.existe && idDeCanalNuevo.existe)
				eventos.push(`${usuario} se unió a ${channelMention(idDeCanalNuevo.valor)}`);

			if (idDeCanalAnterior.existe && !idDeCanalNuevo.existe)
				eventos.push(`${usuario} se desconectó de ${channelMention(idDeCanalAnterior.valor)}`);

			if (idDeCanalAnterior.existe && idDeCanalNuevo.existe && idDeCanalAnterior.valor !== idDeCanalNuevo.valor)
				eventos.push(
					`${usuario} se desconectó de ${channelMention(idDeCanalAnterior.valor)} y se conectó a ${channelMention(idDeCanalNuevo.valor)}`,
				);
		});

		con(existe(this.estadoAnterior.selfMute), existe(this.estadoNuevo.selfMute), (autoMuteAnterior, autoMuteNuevo) => {
			if (!autoMuteAnterior.existe || !autoMuteNuevo.existe) return;

			if (!autoMuteAnterior.valor && autoMuteNuevo.valor) eventos.push(`${usuario} se muteó`);
			if (autoMuteAnterior.valor && !autoMuteNuevo.valor) eventos.push(`${usuario} se desmuteó`);
		});

		con(existe(this.estadoAnterior.selfDeaf), existe(this.estadoNuevo.selfDeaf), (autoSilencioAnterior, autoSilencioNuevo) => {
			if (!autoSilencioAnterior.existe || !autoSilencioNuevo.existe) return;

			if (!autoSilencioAnterior.valor && autoSilencioNuevo.valor) eventos.push(`${usuario} se silenció`);
			if (autoSilencioAnterior.valor && !autoSilencioNuevo.valor) eventos.push(`${usuario} se desilenció`);
		});

		con(existe(this.estadoAnterior.selfVideo), existe(this.estadoNuevo.selfVideo), (camaraAnterior, camaraNuevo) => {
			if (!camaraAnterior.existe || !camaraNuevo.existe) return;

			if (!camaraAnterior.valor && camaraNuevo.valor) eventos.push(`${usuario} activó su cámara`);
			if (camaraAnterior.valor && !camaraNuevo.valor) eventos.push(`${usuario} desactivó su cámara`);
		});

		con(existe(this.estadoAnterior.serverMute), existe(this.estadoNuevo.serverMute), (muteAnterior, muteNuevo) => {
			if (!muteAnterior.existe || !muteNuevo.existe) return;

			if (!muteAnterior.valor && muteNuevo.valor) eventos.push(`${usuario} fue muteado`);
			if (muteAnterior.valor && !muteNuevo.valor) eventos.push(`${usuario} fue desmuteado`);
		});

		con(existe(this.estadoAnterior.serverDeaf), existe(this.estadoNuevo.serverDeaf), (silencioAnterior, silencioNuevo) => {
			if (!silencioAnterior.existe || !silencioNuevo.existe) return;

			if (!silencioAnterior.valor && silencioNuevo.valor) eventos.push(`${usuario} fue silenciado`);
			if (silencioAnterior.valor && !silencioNuevo.valor) eventos.push(`${usuario} fue desilenciado`);
		});

		con(existe(this.estadoAnterior.streaming), existe(this.estadoNuevo.streaming), (transmisionAnterior, transmisionNuevo) => {
			if (!transmisionAnterior.existe || !transmisionNuevo.existe) return;

			if (!transmisionAnterior.valor && transmisionNuevo.valor) eventos.push(`${usuario} comenzó a transmitir`);
			if (transmisionAnterior.valor && !transmisionNuevo.valor) eventos.push(`${usuario} dejó de trasmitir`);
		});

		return pipa(eventos, justo, exito);
	}
}
