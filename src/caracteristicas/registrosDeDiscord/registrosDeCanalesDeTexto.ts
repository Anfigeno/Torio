import {
	type Client,
	ContainerBuilder,
	codeBlock,
	Events,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	type Message,
	type MessageReaction,
	type OmitPartialGroupDMChannel,
	type PartialMessage,
	type PartialMessageReaction,
	type PartialUser,
	SectionBuilder,
	SeparatorBuilder,
	type TextBasedChannel,
	TextDisplayBuilder,
	ThumbnailBuilder,
	type User,
} from "discord.js";
import { canalDeRegistrosDeCanalesDeTexto } from "@/caches";
import ConfiguracionDeDiscord from "@/configuracion/Discord";
import { enviarRegistro } from "./util";

export default function establecerCaracteristicaRegistrosDeCanalesDeTexto(
	cliente: Client,
): void {
	cliente.on(Events.MessageUpdate, registrarMensajeActualizado);
	cliente.on(Events.MessageDelete, registrarMensajeEliminado);
	cliente.on(Events.MessageReactionAdd, registrarReaccionAñadida);
	cliente.on(Events.MessageReactionRemove, registrarReaccionEliminada);
}

function registrarMensajeActualizado(
	mensajeAntiguo: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
	nuevoMensaje: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
) {
	const titulo = "Mensaje actualizado";
	const resumen = crearResumen(
		new Dato("Contenido anterior", mensajeAntiguo.content),
		new Dato("Nuevo contenido", nuevoMensaje.content),
	);

	const componente = crearComponenteDeRegistro(
		titulo,
		resumen,
		nuevoMensaje.author,
		nuevoMensaje.channel,
		nuevoMensaje.url,
	);

	enviarRegistro(componente, canalDeRegistrosDeCanalesDeTexto);
}

function registrarMensajeEliminado(
	mensaje: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
) {
	const titulo = "Mensaje eliminado";
	const resumen = crearResumen(new Dato("Contenido", mensaje.content));

	const componente = crearComponenteDeRegistro(
		titulo,
		resumen,
		mensaje.author,
		mensaje.channel,
	);

	enviarRegistro(componente, canalDeRegistrosDeCanalesDeTexto);
}

function registrarReaccionAñadida(
	{ emoji, message: mensaje }: MessageReaction | PartialMessageReaction,
	usuario: User | PartialUser,
) {
	const titulo = "Reacción añadida";
	const resumen = crearResumen(
		new Dato("Reaccion", emoji.toString(), []),
		new Dato("Al mensaje de contenido", mensaje.content),
	);

	const componente = crearComponenteDeRegistro(
		titulo,
		resumen,
		usuario,
		mensaje.channel,
		mensaje.url,
	);

	enviarRegistro(componente, canalDeRegistrosDeCanalesDeTexto);
}

function registrarReaccionEliminada(
	{ emoji, message: mensaje }: MessageReaction | PartialMessageReaction,
	usuario: User | PartialUser,
) {
	const titulo = "Reacción eliminada";
	const resumen = crearResumen(
		new Dato("Reaccion", emoji.toString(), []),
		new Dato("Al mensaje de contenido", mensaje.content),
	);

	const componente = crearComponenteDeRegistro(
		titulo,
		resumen,
		usuario,
		mensaje.channel,
		mensaje.url,
	);

	enviarRegistro(componente, canalDeRegistrosDeCanalesDeTexto);
}

class Dato {
	constructor(
		public clave: string,
		public valor: string | null | undefined,
		public procesadores: ((valor: string) => string)[] = [codeBlock],
	) {}

	toString(): string {
		return `**${this.clave}:**\n${this.valor ? this.procesadores.reduce((acc, procesador) => procesador(acc), this.valor) : "No se pudo leer el contenido"}`;
	}
}

function crearResumen(...datos: Dato[]): string {
	return datos.map((dato) => dato.toString()).join("\n");
}

function crearComponenteDeRegistro(
	titulo: string,
	contenido: string,
	autor: User | PartialUser | null,
	canal: TextBasedChannel,
	urlDelMensaje?: string,
): ContainerBuilder {
	return new ContainerBuilder()
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${titulo}`))
		.addSeparatorComponents(new SeparatorBuilder())
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(contenido))
				.setThumbnailAccessory(
					new ThumbnailBuilder().setURL(autor?.displayAvatarURL() || ""),
				),
		)
		.addMediaGalleryComponents(
			new MediaGalleryBuilder().addItems(
				new MediaGalleryItemBuilder().setURL(
					ConfiguracionDeDiscord.marca.componentes.urlDeEspaciador,
				),
			),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`
-# Por ${autor}, en ${canal}.${urlDelMensaje ? `  -  [Click aquí para ver el mensaje](${urlDelMensaje})` : ""}
`),
		);
}
