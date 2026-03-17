import {
	type CategoryChannel,
	ChannelType,
	type DMChannel,
	Events,
	inlineCode,
	type NonThreadGuildBasedChannel,
	type Role,
} from "discord.js";
import { canalDeRegistrosDeServidor } from "@/caches";
import { Funci } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";
import { type ErrorAlAsignarEventos, Registro, SinEventosQueAsignar } from "./util";

const registrosDeServidor = Funci.usando(new Caracteristica("Registros de servidor"), (c) => {
	c.agregarManejadorDeEvento(Events.ChannelCreate, (...args) => new CanalCreado(...args).registrar());
	c.agregarManejadorDeEvento(Events.ChannelDelete, (...args) => new CanalEliminado(...args).registrar());
	c.agregarManejadorDeEvento(Events.ChannelUpdate, (...args) => new CanalActualizado(...args).registrar());
	c.agregarManejadorDeEvento(Events.GuildRoleCreate, (...args) => new RolCreado(...args).registrar());
	c.agregarManejadorDeEvento(Events.GuildRoleDelete, (...args) => new RolEliminado(...args).registrar());
	c.agregarManejadorDeEvento(Events.GuildRoleUpdate, (...args) => new RolActualizado(...args).registrar());
});

export default registrosDeServidor;

abstract class RegistroDeServidor extends Registro {
	protected override canalDeRegistros = canalDeRegistrosDeServidor;

	protected static resumirCanal(canal: NonThreadGuildBasedChannel): string {
		return `**${canal.name} - [${inlineCode(canal.id)}](${canal.url})**`;
	}

	protected static tipoDeCanal(tipo: ChannelType): string {
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

	protected static resumirCategoria(categoria: CategoryChannel): string {
		return `**${categoria} - ${inlineCode(categoria.id)}**`;
	}

	protected static resumirRol(rol: Role): string {
		return `**${rol.name} - ${rol.id}**`;
	}
}

class CanalCreado extends RegistroDeServidor {
	constructor(private readonly canal: NonThreadGuildBasedChannel) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<null, ErrorAlAsignarEventos | SinEventosQueAsignar> {
		this.eventos.push(
			`Se creó el canal ${RegistroDeServidor.resumirCanal(this.canal)}, de tipo ${RegistroDeServidor.tipoDeCanal(this.canal.type)}.`,
		);

		return Funci.exito(null);
	}
}

class CanalEliminado extends RegistroDeServidor {
	constructor(private readonly canal: DMChannel | NonThreadGuildBasedChannel) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<null, ErrorAlAsignarEventos | SinEventosQueAsignar> {
		if (this.canal.isDMBased())
			return Funci.fallo(
				new SinEventosQueAsignar({
					mensaje: "No se registran canales de mensajes diretos",
				}),
			);

		this.eventos.push(
			`Se eliminó el canal ${RegistroDeServidor.resumirCanal(this.canal)}, de tipo ${RegistroDeServidor.tipoDeCanal(this.canal.type)}.`,
		);

		return Funci.exito(null);
	}
}

class CanalActualizado extends RegistroDeServidor {
	constructor(
		private readonly canalAntiguo: DMChannel | NonThreadGuildBasedChannel,
		private readonly canalNuevo: DMChannel | NonThreadGuildBasedChannel,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<null, ErrorAlAsignarEventos | SinEventosQueAsignar> {
		if (this.canalAntiguo.isDMBased() || this.canalNuevo.isDMBased())
			return Funci.fallo(
				new SinEventosQueAsignar({
					mensaje: "No se registran canales de mensajes directos",
				}),
			);

		if (this.canalAntiguo.name !== this.canalNuevo.name)
			this.eventos.push(
				`Se actualizó el nombre del canal ${RegistroDeServidor.resumirCanal(this.canalAntiguo)}, de ${this.canalAntiguo.name} a ${this.canalNuevo.name}`,
			);

		if (!this.canalAntiguo.parent && this.canalNuevo.parent)
			this.eventos.push(
				`Se añadió el canal ${RegistroDeServidor.resumirCanal(this.canalAntiguo)} a la categoria ${RegistroDeServidor.resumirCategoria(this.canalNuevo.parent)}`,
			);

		if (this.canalAntiguo.parent && this.canalNuevo.parent && this.canalAntiguo.parentId !== this.canalNuevo.parentId)
			this.eventos.push(
				`Se cambió la categoría del canal ${RegistroDeServidor.resumirCanal(this.canalAntiguo)}, de ${RegistroDeServidor.resumirCategoria(this.canalAntiguo.parent)} a ${RegistroDeServidor.resumirCategoria(this.canalNuevo.parent)}`,
			);

		if (this.canalAntiguo.parent && !this.canalNuevo.parent)
			this.eventos.push(
				`Se quitó el canal ${RegistroDeServidor.resumirCanal(this.canalAntiguo)} de la categoría ${this.canalAntiguo.parent}`,
			);

		return Funci.exito(null);
	}
}

class RolCreado extends RegistroDeServidor {
	constructor(private readonly rol: Role) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<null, ErrorAlAsignarEventos | SinEventosQueAsignar> {
		this.eventos.push(`Se creó el rol ${RegistroDeServidor.resumirRol(this.rol)}`);

		return Funci.exito(null);
	}
}

class RolEliminado extends RegistroDeServidor {
	constructor(private readonly rol: Role) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<null, ErrorAlAsignarEventos | SinEventosQueAsignar> {
		this.eventos.push(`Se eliminó el rol ${RegistroDeServidor.resumirRol(this.rol)}`);

		return Funci.exito(null);
	}
}

class RolActualizado extends RegistroDeServidor {
	constructor(
		private readonly rolAntiguo: Role,
		private readonly rolNuevo: Role,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<null, ErrorAlAsignarEventos | SinEventosQueAsignar> {
		if (this.rolAntiguo.name !== this.rolNuevo.name)
			this.eventos.push(
				`Se actualizó el nombre del rol ${RegistroDeServidor.resumirRol(this.rolAntiguo)} por ${RegistroDeServidor.resumirRol(this.rolNuevo)}`,
			);

		if (this.rolAntiguo.hexColor !== this.rolNuevo.hexColor)
			this.eventos.push(
				`Se actualizó el color del rol ${RegistroDeServidor.resumirRol(this.rolAntiguo)}, de ${this.rolAntiguo.hexColor} a ${this.rolNuevo.hexColor}`,
			);

		if (!this.rolAntiguo.permissions.equals(this.rolNuevo.permissions)) {
			const permisosAntiguos = this.rolAntiguo.permissions.serialize();
			const permisosNuevos = this.rolNuevo.permissions.serialize();

			const constructorDeResumenDeDiferencias: string[] = [];

			for (const [claveAntigua, valorAntiguo] of Funci.Objeto.entradas(permisosAntiguos)) {
				if (valorAntiguo !== permisosNuevos[claveAntigua]) {
					constructorDeResumenDeDiferencias.push(
						`- ${claveAntigua}: __${valorAntiguo ? "Sí" : "No"}__ -> **${permisosNuevos[claveAntigua] ? "Sí" : "No"}**`,
					);
				}
			}

			const diferencias = constructorDeResumenDeDiferencias.join("\n");

			this.eventos.push(`
Se actualizaron los permisos del rol ${RegistroDeServidor.resumirRol(this.rolAntiguo)} :
${diferencias}
`);
		}

		return Funci.exito(null);
	}
}
