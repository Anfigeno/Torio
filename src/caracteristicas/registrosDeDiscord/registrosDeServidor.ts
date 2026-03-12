import {
	type CategoryChannel,
	ChannelType,
	type Client,
	ContainerBuilder,
	type DMChannel,
	Events,
	inlineCode,
	type NonThreadGuildBasedChannel,
	type Role,
	TextDisplayBuilder,
} from "discord.js";
import { canalDeRegistrosDeServidor } from "@/caches";
import { Funci } from "@/lib/Funci";
import { enviarRegistro } from "./util";

export default function establecerCaracteristicaDeRegistrosDeServidor(
	cliente: Client,
): void {
	cliente.on(Events.ChannelCreate, registrarCanalCreado);
	cliente.on(Events.ChannelDelete, registrarCanalEliminado);
	cliente.on(Events.ChannelUpdate, registrarCanalActualizado);
	cliente.on(Events.GuildRoleCreate, registrarRolCreado);
	cliente.on(Events.GuildRoleDelete, registrarRolEliminado);
	cliente.on(Events.GuildRoleUpdate, registrarRolActualizado);
}

function registrarCanalCreado(canal: NonThreadGuildBasedChannel): void {
	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`
Se creó el canal ${resumirCanal(canal)}, de tipo ${tipoDeCanal(canal.type)}.
`),
	);

	enviarRegistro(resumen, canalDeRegistrosDeServidor);
}

function registrarCanalEliminado(canal: DMChannel | NonThreadGuildBasedChannel): void {
	if (canal.isDMBased()) return;

	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`
Se eliminó el canal ${resumirCanal(canal)}, de tipo ${tipoDeCanal(canal.type)}.
`),
	);

	enviarRegistro(resumen, canalDeRegistrosDeServidor);
}

function registrarCanalActualizado(
	canalAntiguo: DMChannel | NonThreadGuildBasedChannel,
	nuevoCanal: DMChannel | NonThreadGuildBasedChannel,
): void {
	if (canalAntiguo.isDMBased() || nuevoCanal.isDMBased()) return;

	let accion: string;

	if (canalAntiguo.name !== nuevoCanal.name) {
		accion = `Se actualizó el nombre del canal ${resumirCanal(canalAntiguo)}, de ${canalAntiguo.name} a ${nuevoCanal.name}`;
	} else if (!canalAntiguo.parent && nuevoCanal.parent) {
		accion = `Se añadió el canal ${resumirCanal(canalAntiguo)} a la categoria ${resumirCategoria(nuevoCanal.parent)}`;
	} else if (
		canalAntiguo.parent &&
		nuevoCanal.parent &&
		canalAntiguo.parentId !== nuevoCanal.parentId
	) {
		accion = `Se cambió la categoría del canal ${resumirCanal(canalAntiguo)}, de ${resumirCategoria(canalAntiguo.parent)} a ${resumirCategoria(nuevoCanal.parent)}`;
	} else if (canalAntiguo.parent && !nuevoCanal.parent) {
		accion = `Se quitó el canal ${resumirCanal(canalAntiguo)} de la categoría ${canalAntiguo.parent}`;
	} else {
		return;
	}

	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(accion),
	);

	enviarRegistro(resumen, canalDeRegistrosDeServidor);
}

function resumirCanal(canal: NonThreadGuildBasedChannel): string {
	return `**${canal.name} - [${inlineCode(canal.id)}](${canal.url})**`;
}

function resumirCategoria(categoria: CategoryChannel): string {
	return `**${categoria} - ${inlineCode(categoria.id)}**`;
}

function tipoDeCanal(tipo: ChannelType): string {
	const nombres: Record<ChannelType, string> = {
		[ChannelType.GuildText]: "Canal de texto",
		[ChannelType.DM]: "Mensaje directo",
		[ChannelType.GuildVoice]: "Canal de voz",
		[ChannelType.GroupDM]: "Grupo de mensajes directos",
		[ChannelType.GuildCategory]: "Categoría",
		[ChannelType.GuildAnnouncement]: "Canal de anuncios",
		[ChannelType.AnnouncementThread]: "Hilo de anuncios",
		[ChannelType.PublicThread]: "Hilo público",
		[ChannelType.PrivateThread]: "Hilo privado",
		[ChannelType.GuildStageVoice]: "Canal de escenario",
		[ChannelType.GuildDirectory]: "Directorio de servidor",
		[ChannelType.GuildForum]: "Canal de foro",
		[ChannelType.GuildMedia]: "Canal de medios",
	};

	return nombres[tipo] ?? `Tipo desconocido (${tipo})`;
}

function registrarRolCreado(rol: Role): void {
	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`
Se creó el rol ${resumirRol(rol)}
`),
	);

	enviarRegistro(resumen, canalDeRegistrosDeServidor);
}

function registrarRolEliminado(rol: Role): void {
	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`
Se eliminó el rol ${resumirRol(rol)}
`),
	);

	enviarRegistro(resumen, canalDeRegistrosDeServidor);
}

function registrarRolActualizado(rolAntiguo: Role, rolNuevo: Role): void {
	const acciones: string[] = [];

	if (rolAntiguo.name !== rolNuevo.name) {
		acciones.push(
			`Se actualizó el nombre del rol ${resumirRol(rolAntiguo)} por ${resumirRol(rolNuevo)}`,
		);
	}
	if (rolAntiguo.hexColor !== rolNuevo.hexColor) {
		acciones.push(
			`Se actualizó el color del rol ${resumirRol(rolAntiguo)}, de ${rolAntiguo.hexColor} a ${rolNuevo.hexColor}`,
		);
	}
	if (!rolAntiguo.permissions.equals(rolNuevo.permissions)) {
		const permisosAntiguos = rolAntiguo.permissions.serialize();
		const permisosNuevos = rolNuevo.permissions.serialize();

		const constructorDeResumenDeDiferencias: string[] = [];

		for (const [claveAntigua, valorAntiguo] of Funci.Objeto.entradas(permisosAntiguos)) {
			if (valorAntiguo !== permisosNuevos[claveAntigua]) {
				constructorDeResumenDeDiferencias.push(
					`- ${claveAntigua}: __${valorAntiguo ? "Sí" : "No"}__ -> **${permisosNuevos[claveAntigua] ? "Sí" : "No"}**`,
				);
			}
		}

		const diferencias = constructorDeResumenDeDiferencias.join("\n");

		acciones.push(`
Se actualizaron los permisos del rol ${resumirRol(rolAntiguo)} :
${diferencias}
`);
	}

	if (acciones.length === 0) return;

	const resumen = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(acciones.join("\n\n")),
	);

	enviarRegistro(resumen, canalDeRegistrosDeServidor);
}

function resumirRol(rol: Role): string {
	return `**${rol.name} - ${rol.id}**`;
}
