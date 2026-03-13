import {
	type Client,
	codeBlock,
	Events,
	type Message,
	type MessageReaction,
	type OmitPartialGroupDMChannel,
	type PartialMessage,
	type PartialMessageReaction,
	type PartialUser,
	type User,
} from "discord.js";
import { canalDeRegistrosDeCanalesDeTexto } from "@/caches";
import { Funci } from "@/lib/Funci";
import { ErrorAlAsignarEventos, Registro, SinEventosQueAsignar } from "./util";

export default function establecerCaracteristicaRegistrosDeCanalesDeTexto(
	cliente: Client,
): void {
	cliente.on(Events.MessageUpdate, (ma, mn) => new MensajeEditado(ma, mn).registrar());
	cliente.on(Events.MessageDelete, (m) => new MensajeEliminado(m).registrar());
	cliente.on(Events.MessageReactionAdd, (r, u) => new ReaccionAgregada(r, u).registrar());
	cliente.on(Events.MessageReactionRemove, (r, u) =>
		new ReaccionEliminada(r, u).registrar(),
	);
}

abstract class RegistroDeCanalesDeTexto extends Registro {
	protected override canalDeRegistros = canalDeRegistrosDeCanalesDeTexto;
}

class MensajeEditado extends RegistroDeCanalesDeTexto {
	constructor(
		private mensajeAntiguo: OmitPartialGroupDMChannel<
			Message<boolean> | PartialMessage<boolean>
		>,
		private nuevoMensaje: OmitPartialGroupDMChannel<
			Message<boolean> | PartialMessage<boolean>
		>,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<
		null,
		ErrorAlAsignarEventos | SinEventosQueAsignar
	> {
		if (!this.mensajeAntiguo.content || !this.nuevoMensaje.content)
			return Funci.fallo(
				new ErrorAlAsignarEventos({ mensaje: "Uno de los mensajes no tiene contenido?" }),
			);
		if (this.mensajeAntiguo.content === this.nuevoMensaje.content)
			return Funci.fallo(
				new SinEventosQueAsignar({ mensaje: "El contenido no ha cambiado" }),
			);

		const usuario = this.mensajeAntiguo.member?.user || this.nuevoMensaje.member?.user;

		this.eventos.push(`
${usuario} editó su mensaje de contenido:
${codeBlock(this.mensajeAntiguo.content)}
a:
${codeBlock(this.nuevoMensaje.content)}
en el canal ${this.nuevoMensaje.channel}. [Clic aquí para ver](${this.nuevoMensaje.url})
`);

		return Funci.exito(null);
	}
}

class MensajeEliminado extends RegistroDeCanalesDeTexto {
	constructor(
		private mensaje: OmitPartialGroupDMChannel<
			Message<boolean> | PartialMessage<boolean>
		>,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<
		null,
		ErrorAlAsignarEventos | SinEventosQueAsignar
	> {
		if (!this.mensaje.content)
			return Funci.fallo(
				new ErrorAlAsignarEventos({ mensaje: "El mensaje no tiene contenido?" }),
			);

		this.eventos.push(`
${this.mensaje.member?.user} eliminó su mensaje de contenido:
${codeBlock(this.mensaje.content)}
en el canal ${this.mensaje.channel}.
`);

		return Funci.exito(null);
	}
}

class ReaccionAgregada extends RegistroDeCanalesDeTexto {
	constructor(
		private reaccion: MessageReaction | PartialMessageReaction,
		private usuario: User | PartialUser,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<
		null,
		ErrorAlAsignarEventos | SinEventosQueAsignar
	> {
		if (!this.reaccion.message.content)
			return Funci.fallo(
				new ErrorAlAsignarEventos({ mensaje: "El mensaje no tiene contenido?" }),
			);

		this.eventos.push(`
${this.usuario} añadio la reacción ${this.reaccion.emoji} al mensaje de contenido:
${codeBlock(this.reaccion.message.content)}
en el canal ${this.reaccion.message.channel}. [Clic aquí para ver](${this.reaccion.message.url})
`);

		return Funci.exito(null);
	}
}

class ReaccionEliminada extends RegistroDeCanalesDeTexto {
	constructor(
		private reaccion: MessageReaction | PartialMessageReaction,
		private usuario: User | PartialUser,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<
		null,
		ErrorAlAsignarEventos | SinEventosQueAsignar
	> {
		if (!this.reaccion.message.content)
			return Funci.fallo(
				new ErrorAlAsignarEventos({ mensaje: "El mensaje no tiene contenido?" }),
			);

		this.eventos.push(`
${this.usuario} eliminó su reacción ${this.reaccion.emoji} del mensaje de contenido:
${codeBlock(this.reaccion.message.content)}
en el canal ${this.reaccion.message.channel}. [Clic aquí para ver](${this.reaccion.message.url})
`);

		return Funci.exito(null);
	}
}
