import { Events, type GuildMember, type GuildTextBasedChannel, inlineCode, type PartialGuildMember } from "discord.js";
import { canalDeRegistrosDeUsuarios, type ErrorAlObtenerCanal } from "@/caches";
import type Cachos from "@/lib/Cachos";
import { Funci } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";
import { type ErrorAlAsignarEventos, Registro } from "./Registro";

export const registrosDeUsuarios = Funci.usando(new Caracteristica("Registros de usuarios"), (c) => {
	c.agregarManejadorDeEvento(Events.GuildMemberAdd, (...args) => new MiembroSeUnio(...args).registrar());
	c.agregarManejadorDeEvento(Events.GuildMemberRemove, (...args) => new MiembroSeFue(...args).registrar());
	c.agregarManejadorDeEvento(Events.GuildMemberUpdate, (...args) => new MiembroActualizado(...args).registrar());
});

abstract class RegistroDeUsuario extends Registro {
	protected override canalDeRegistros: Cachos<GuildTextBasedChannel, ErrorAlObtenerCanal> = canalDeRegistrosDeUsuarios;
}

class MiembroSeUnio extends RegistroDeUsuario {
	constructor(private readonly miembro: GuildMember) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<Funci.Quiza<string[]>, ErrorAlAsignarEventos> {
		const eventos: string[] = [];

		eventos.push(`${this.miembro} se unió al servidor`);

		return Funci.pipa(eventos, Funci.justo, Funci.exito);
	}
}

class MiembroSeFue extends RegistroDeUsuario {
	constructor(private readonly miembro: GuildMember | PartialGuildMember) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<Funci.Quiza<string[]>, ErrorAlAsignarEventos> {
		const eventos: string[] = [];

		eventos.push(`${this.miembro} se fue del servidor`);

		return Funci.pipa(eventos, Funci.justo, Funci.exito);
	}
}

class MiembroActualizado extends RegistroDeUsuario {
	constructor(
		private readonly miembroAntiguo: GuildMember | PartialGuildMember,
		private readonly miembroNuevo: GuildMember,
	) {
		super();
	}

	protected override asignarEventos(): Funci.Resultado<Funci.Quiza<string[]>, ErrorAlAsignarEventos> {
		const eventos: string[] = [];

		Funci.con(this.miembroAntiguo.nickname, this.miembroNuevo.nickname, (apodoAntiguo, apodoNuevo) => {
			if (!apodoAntiguo && apodoNuevo) eventos.push(`${this.miembroNuevo} se puso el apodo ${inlineCode(apodoNuevo)}`);
			if (apodoAntiguo && !apodoNuevo) eventos.push(`${this.miembroNuevo} se quitó el apodo`);
			if (apodoAntiguo && apodoNuevo && apodoAntiguo !== apodoNuevo)
				eventos.push(`${this.miembroNuevo} se cambió el apodo, de ${inlineCode(apodoAntiguo)} a ${inlineCode(apodoNuevo)}`);
		});

		Funci.con(this.miembroAntiguo.avatarURL(), this.miembroNuevo.avatarURL(), (avatarAntiguo, avatarNuevo) => {
			if (!avatarAntiguo && avatarNuevo) eventos.push(`${this.miembroNuevo} se puso el avatar de servidor: ${avatarNuevo}`);
			if (avatarAntiguo && !avatarNuevo) eventos.push(`${this.miembroNuevo} se quitó el avatar de servidor`);
			if (avatarAntiguo && avatarNuevo && avatarAntiguo !== avatarNuevo)
				eventos.push(`${this.miembroNuevo} se cambió el avatar de servidor, de ${avatarAntiguo} por ${avatarNuevo}`);
		});

		Funci.con(this.miembroAntiguo.user.avatarURL(), this.miembroNuevo.user.avatarURL(), (avatarAntiguo, avatarNuevo) => {
			if (!avatarAntiguo && avatarNuevo) eventos.push(`${this.miembroNuevo} se puso el avatar\n${avatarNuevo}`);
			if (avatarAntiguo && !avatarNuevo) eventos.push(`${this.miembroNuevo} se quitó el avatar`);
			if (avatarAntiguo && avatarNuevo && avatarAntiguo !== avatarNuevo)
				eventos.push(`${this.miembroNuevo} se cambió el avatar, de\n${avatarAntiguo}\npor\n${avatarNuevo}`);
		});

		Funci.con(this.miembroAntiguo.bannerURL(), this.miembroNuevo.bannerURL(), (cartelAntiguo, cartelNuevo) => {
			if (!cartelAntiguo && cartelNuevo) eventos.push(`${this.miembroNuevo} se puso el cartel de servidor\n${cartelNuevo}`);
			else if (cartelAntiguo && !cartelNuevo) eventos.push(`${this.miembroNuevo} se quitó el cartel de servidor`);
			else if (cartelAntiguo !== cartelNuevo)
				eventos.push(`${this.miembroNuevo} se cambió el cartel de servidor, de\n${cartelAntiguo}\npor\n${cartelNuevo}`);
		});

		Funci.con(this.miembroAntiguo.user.bannerURL(), this.miembroNuevo.user.bannerURL(), (cartelAntiguo, cartelNuevo) => {
			if (!cartelAntiguo && cartelNuevo) eventos.push(`${this.miembroNuevo} se puso el cartel\n${cartelNuevo}`);
			if (cartelAntiguo && !cartelNuevo) eventos.push(`${this.miembroNuevo} se quitó el cartel`);
			if (cartelAntiguo && cartelNuevo && cartelAntiguo !== cartelNuevo)
				eventos.push(`${this.miembroNuevo} se cambió el cartel, de\n${cartelAntiguo}\npor\n${cartelNuevo}`);
		});

		Funci.con(this.miembroAntiguo.user.username, this.miembroNuevo.user.username, (nombreAntiguo, nombreNuevo) => {
			if (nombreAntiguo !== nombreNuevo)
				eventos.push(
					`${this.miembroNuevo} cambió su nombre de usuario, de ${inlineCode(nombreAntiguo)}, por ${inlineCode(nombreNuevo)}`,
				);
		});

		Funci.con(this.miembroAntiguo.roles.cache, this.miembroNuevo.roles.cache, (rolesAntiguos, rolesNuevos) => {
			if (rolesAntiguos.equals(rolesNuevos)) return;

			const constructorDeRolesEliminados: string[] = [];
			const constructorDeRolesAgregados: string[] = [];

			for (const [id, rol] of rolesAntiguos.entries()) {
				if (!rolesNuevos.get(id)) constructorDeRolesEliminados.push(`${rol} - ${inlineCode(rol.id)}`);
			}

			for (const [id, rol] of rolesNuevos.entries()) {
				if (!rolesAntiguos.get(id)) constructorDeRolesAgregados.push(`${rol} - ${inlineCode(rol.id)}`);
			}

			if (constructorDeRolesAgregados.length !== 0)
				eventos.push(`${this.miembroNuevo} obtuvo los roles\n${constructorDeRolesAgregados.map((v) => `- ${v}`).join("\n")}`);

			if (constructorDeRolesEliminados.length !== 0)
				eventos.push(`${this.miembroNuevo} perdió los roles\n${constructorDeRolesEliminados.map((v) => `- ${v}`).join("\n")}`);
		});

		return Funci.pipa(eventos, Funci.justo, Funci.exito);
	}
}
