import { Events, type VoiceState } from "discord.js";
import { canalDeRegistrosDeCanalesDeVoz } from "@/caches";
import { Funci } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";
import { ErrorAlAsignarEventos, Registro } from "./Registro";

const registrosDeCanalesDeVoz = Funci.usando(new Caracteristica("Registros de canales de voz"), (c) => {
	c.agregarManejadorDeEvento(Events.VoiceStateUpdate, (...args) => new CambioDeEstado(...args).registrar());
});

export default registrosDeCanalesDeVoz;

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

	protected override asignarEventos(): Funci.Resultado<Funci.Quiza<string[]>, ErrorAlAsignarEventos> {
		const usuario = this.estadoNuevo.member?.user || this.estadoAnterior.member?.user;

		if (!usuario) {
			return Funci.fallo(new ErrorAlAsignarEventos({ mensaje: "No se encontró el usuario" }));
		}

		const eventos: string[] = [];

		if (!this.estadoAnterior.channelId && this.estadoNuevo.channelId)
			eventos.push(`${usuario} se unió a ${this.estadoNuevo.channel}`);

		if (this.estadoAnterior.channelId && !this.estadoNuevo.channelId)
			eventos.push(`${usuario} se desconectó de ${this.estadoAnterior.channel}`);

		if (this.estadoAnterior.channelId !== this.estadoNuevo.channelId)
			eventos.push(`${usuario} se desconectó de ${this.estadoAnterior.channel} y se conectó a ${this.estadoNuevo.channel}`);

		if (!this.estadoAnterior.selfMute && this.estadoNuevo.selfMute)
			eventos.push(`${usuario} se muteó en ${this.estadoNuevo.channel}`);

		if (this.estadoAnterior.selfMute && !this.estadoNuevo.selfMute)
			eventos.push(`${usuario} se desmuteó en ${this.estadoNuevo.channel}`);

		if (!this.estadoAnterior.selfDeaf && this.estadoNuevo.selfDeaf)
			eventos.push(`${usuario} se silenció en ${this.estadoNuevo.channel}`);

		if (this.estadoAnterior.selfDeaf && !this.estadoNuevo.selfDeaf)
			eventos.push(`${usuario} se desilenció en ${this.estadoNuevo.channel}`);

		if (!this.estadoAnterior.selfVideo && this.estadoNuevo.selfVideo)
			eventos.push(`${usuario} activó su cámara en ${this.estadoNuevo.channel}`);

		if (this.estadoAnterior.selfVideo && !this.estadoNuevo.selfVideo)
			eventos.push(`${usuario} desactivó su cámara en ${this.estadoNuevo.channel}`);

		if (!this.estadoAnterior.serverMute && this.estadoNuevo.serverMute) eventos.push(`${usuario} fue muteado por un moderador`);

		if (this.estadoAnterior.serverMute && !this.estadoNuevo.serverMute)
			eventos.push(`${usuario} fue desmuteado por un moderador`);

		if (!this.estadoAnterior.serverDeaf && this.estadoNuevo.serverDeaf)
			eventos.push(`${usuario} fue silenciado por un moderador`);

		if (this.estadoAnterior.serverDeaf && !this.estadoNuevo.serverDeaf)
			eventos.push(`${usuario} fue desilenciado por un moderador`);

		if (!this.estadoAnterior.streaming && this.estadoNuevo.streaming) eventos.push(`${usuario} comenzó a transmitir`);

		if (this.estadoAnterior.streaming && !this.estadoNuevo.streaming) eventos.push(`${usuario} dejó de transmitir`);

		return Funci.pipa(eventos, Funci.justo, Funci.exito);
	}
}
