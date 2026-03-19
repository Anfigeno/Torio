import {
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
import { Caracteristica } from "@/lib/Torio";
import { ErrorAlAsignarEventos, Registro, SinEventosQueAsignar } from "./Registro";

const registrosDeCanalesDeTexto = Funci.usando(new Caracteristica("Registros de canales de texto"), (c) => {
	c.agregarManejadorDeEvento(Events.MessageUpdate, (...args) => new MensajeEditado(...args).registrar());
	c.agregarManejadorDeEvento(Events.MessageDelete, (...args) => new MensajeEliminado(...args).registrar());
	c.agregarManejadorDeEvento(Events.MessageReactionAdd, (...args) => new ReaccionAgregada(...args).registrar());
	c.agregarManejadorDeEvento(Events.MessageReactionRemove, (...args) => new ReaccionEliminada(...args).registrar());
});

export default registrosDeCanalesDeTexto;

abstract class RegistroDeCanalesDeTexto extends Registro {
	protected override canalDeRegistros = canalDeRegistrosDeCanalesDeTexto;
}

class MensajeEditado extends RegistroDeCanalesDeTexto {
	constructor(
		private mensajeAntiguo: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
		private nuevoMensaje: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<Funci.Quiza<string[]>, ErrorAlAsignarEventos> {
		if (!this.mensajeAntiguo.content || !this.nuevoMensaje.content)
			return Funci.fallo(new ErrorAlAsignarEventos({ mensaje: "Uno de los mensajes no tiene contenido?" }));
		if (this.mensajeAntiguo.content === this.nuevoMensaje.content)
			return Funci.fallo(new SinEventosQueAsignar({ mensaje: "El contenido no ha cambiado" }));

		const eventos = [];
		const usuario = this.mensajeAntiguo.member?.user || this.nuevoMensaje.member?.user;

		eventos.push(`
${usuario} editó su mensaje de contenido:
${codeBlock(this.mensajeAntiguo.content)}
a:
${codeBlock(this.nuevoMensaje.content)}
en el canal ${this.nuevoMensaje.channel}. [Clic aquí para ver](${this.nuevoMensaje.url})
`);

		if (eventos.length === 0) return Funci.exito(Funci.nada());
		return Funci.pipa(eventos, Funci.justo, Funci.exito);
	}
}

class MensajeEliminado extends RegistroDeCanalesDeTexto {
	constructor(private mensaje: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<Funci.Quiza<string[]>, ErrorAlAsignarEventos> {
		if (!this.mensaje.content) return Funci.fallo(new ErrorAlAsignarEventos({ mensaje: "El mensaje no tiene contenido?" }));

		const eventos: string[] = [];

		eventos.push(`
${this.mensaje.member?.user} eliminó su mensaje de contenido:
${codeBlock(this.mensaje.content)}
en el canal ${this.mensaje.channel}.
`);

		return Funci.pipa(eventos, Funci.justo, Funci.exito);
	}
}

class ReaccionAgregada extends RegistroDeCanalesDeTexto {
	constructor(
		private reaccion: MessageReaction | PartialMessageReaction,
		private usuario: User | PartialUser,
		_: unknown,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<Funci.Quiza<string[]>, ErrorAlAsignarEventos> {
		if (!this.reaccion.message.content)
			return Funci.fallo(new ErrorAlAsignarEventos({ mensaje: "El mensaje no tiene contenido?" }));

		const eventos: string[] = [];

		eventos.push(`
${this.usuario} añadio la reacción ${this.reaccion.emoji} al mensaje de contenido:
${codeBlock(this.reaccion.message.content)}
en el canal ${this.reaccion.message.channel}. [Clic aquí para ver](${this.reaccion.message.url})
`);

		return Funci.pipa(eventos, Funci.justo, Funci.exito);
	}
}

class ReaccionEliminada extends RegistroDeCanalesDeTexto {
	constructor(
		private reaccion: MessageReaction | PartialMessageReaction,
		private usuario: User | PartialUser,
		_: unknown,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<Funci.Quiza<string[]>, ErrorAlAsignarEventos> {
		if (!this.reaccion.message.content)
			return Funci.fallo(new ErrorAlAsignarEventos({ mensaje: "El mensaje no tiene contenido?" }));

		const eventos: string[] = [];

		eventos.push(`
${this.usuario} eliminó su reacción ${this.reaccion.emoji} del mensaje de contenido:
${codeBlock(this.reaccion.message.content)}
en el canal ${this.reaccion.message.channel}. [Clic aquí para ver](${this.reaccion.message.url})
`);

		return Funci.pipa(eventos, Funci.justo, Funci.exito);
	}
}
