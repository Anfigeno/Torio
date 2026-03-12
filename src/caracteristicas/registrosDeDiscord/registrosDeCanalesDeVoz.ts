import {
	type Client,
	ContainerBuilder,
	Events,
	TextDisplayBuilder,
	type VoiceState,
} from "discord.js";
import { canalDeRegistrosDeCanalesDeVoz } from "@/caches";
import registro from "@/configuracion/registro";
import { enviarRegistro } from "./util";

export default function establecerCaracteristicaDeRegistrosDeCanalesDeVoz(
	cliente: Client,
): void {
	cliente.on(Events.VoiceStateUpdate, registrarCambioDeEstado);
}

function registrarCambioDeEstado(
	estadoAnterior: VoiceState,
	nuevoEstado: VoiceState,
): void {
	const usuario = nuevoEstado.member?.user || estadoAnterior.member?.user;

	if (!usuario) {
		registro.error("No se pudo obtener el usuario");
		return;
	}

	let accion: string | null = null;

	if (!estadoAnterior.channelId && nuevoEstado.channelId) {
		accion = `
${usuario} se unió a ${nuevoEstado.channel}
`;
	} else if (estadoAnterior.channelId && !nuevoEstado.channelId) {
		accion = `
${usuario} se desconectó de ${estadoAnterior.channel}
`;
	} else if (estadoAnterior.channelId !== nuevoEstado.channelId) {
		accion = `${usuario} se desconectó de ${estadoAnterior.channel} y se conectó a ${nuevoEstado.channel}`;
	} else if (!estadoAnterior.selfMute && nuevoEstado.selfMute) {
		accion = `${usuario} se muteó en ${nuevoEstado.channel}`;
	} else if (estadoAnterior.selfMute && !nuevoEstado.selfMute) {
		accion = `${usuario} se desmuteó en ${nuevoEstado.channel}`;
	} else if (!estadoAnterior.selfDeaf && nuevoEstado.selfDeaf) {
		accion = `${usuario} se silenció en ${nuevoEstado.channel}`;
	} else if (estadoAnterior.selfDeaf && !nuevoEstado.selfDeaf) {
		accion = `${usuario} se desilenció en ${nuevoEstado.channel}`;
	} else if (!estadoAnterior.selfVideo && nuevoEstado.selfVideo) {
		accion = `${usuario} activó su cámara en ${nuevoEstado.channel}`;
	} else if (estadoAnterior.selfVideo && !nuevoEstado.selfVideo) {
		accion = `${usuario} desactivó su cámara en ${nuevoEstado.channel}`;
	} else if (!estadoAnterior.serverMute && nuevoEstado.serverMute) {
		accion = `${usuario} fue muteado por un moderador`;
	} else if (estadoAnterior.serverMute && !nuevoEstado.serverMute) {
		accion = `${usuario} fue desmuteado por un moderador`;
	} else if (!estadoAnterior.serverDeaf && nuevoEstado.serverDeaf) {
		accion = `${usuario} fue silenciado por un moderador`;
	} else if (estadoAnterior.serverDeaf && !nuevoEstado.serverDeaf) {
		accion = `${usuario} fue desilenciado por un moderador`;
	} else if (!estadoAnterior.streaming && nuevoEstado.streaming) {
		accion = `${usuario} comenzó a transmitir`;
	} else if (estadoAnterior.streaming && !nuevoEstado.streaming) {
		accion = `${usuario} dejó de transmitir`;
	}

	if (!accion) return;

	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(accion),
	);

	enviarRegistro(resumen, canalDeRegistrosDeCanalesDeVoz);
}
