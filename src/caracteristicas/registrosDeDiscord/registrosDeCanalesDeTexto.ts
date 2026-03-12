import {
	type Client,
	ContainerBuilder,
	codeBlock,
	Events,
	type Message,
	type MessageReaction,
	type OmitPartialGroupDMChannel,
	type PartialMessage,
	type PartialMessageReaction,
	type PartialUser,
	TextDisplayBuilder,
	type User,
} from "discord.js";
import { canalDeRegistrosDeCanalesDeTexto } from "@/caches";
import { enviarRegistro } from "./util";

export default function establecerCaracteristicaRegistrosDeCanalesDeTexto(
	cliente: Client,
): void {
	cliente.on(Events.MessageUpdate, registrarMensajeEditado);
	cliente.on(Events.MessageDelete, registrarMensajeEliminado);
	cliente.on(Events.MessageReactionAdd, registrarReaccionAñadida);
	cliente.on(Events.MessageReactionRemove, registrarReaccionEliminada);
}

function registrarMensajeEditado(
	mensajeAntiguo: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
	nuevoMensaje: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
) {
	if (!mensajeAntiguo.content || !nuevoMensaje.content) return;
	if (mensajeAntiguo.content === nuevoMensaje.content) return;

	const usuario = mensajeAntiguo.member?.user || nuevoMensaje.member?.user;

	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`
${usuario} editó su mensaje de contenido:
${codeBlock(mensajeAntiguo.content)}
a:
${codeBlock(nuevoMensaje.content)}
en el canal ${nuevoMensaje.channel}. [Clic aquí para ver](${nuevoMensaje.url})
`),
	);

	enviarRegistro(resumen, canalDeRegistrosDeCanalesDeTexto);
}

function registrarMensajeEliminado(
	mensaje: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
) {
	if (!mensaje.content) return;

	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`
${mensaje.member?.user} eliminó su mensaje de contenido:
${codeBlock(mensaje.content)}
en el canal ${mensaje.channel}. [Clic aquí para ver](${mensaje.url})
`),
	);

	enviarRegistro(resumen, canalDeRegistrosDeCanalesDeTexto);
}

function registrarReaccionAñadida(
	{ emoji, message: mensaje }: MessageReaction | PartialMessageReaction,
	usuario: User | PartialUser,
) {
	if (!mensaje.content) return;

	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`${usuario} añadio la reacción ${emoji} al mensaje de contenido:
${codeBlock(mensaje.content)}
en el canal ${mensaje.channel}. [Clic aquí para ver](${mensaje.url})`,
		),
	);

	enviarRegistro(resumen, canalDeRegistrosDeCanalesDeTexto);
}

function registrarReaccionEliminada(
	{ emoji, message: mensaje }: MessageReaction | PartialMessageReaction,
	usuario: User | PartialUser,
) {
	if (!mensaje.content) return;

	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`
${usuario} eliminó su reacción ${emoji} del mensaje de contenido:
${codeBlock(mensaje.content)}
en el canal ${mensaje.channel}.
`),
	);

	enviarRegistro(resumen, canalDeRegistrosDeCanalesDeTexto);
}
