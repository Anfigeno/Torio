import { codeBlock, Events, type GuildMember, type GuildTextBasedChannel, inlineCode, type PartialGuildMember } from "discord.js";
import { canalDeRegistrosDeUsuarios, type ErrorAlObtenerCanal } from "@/caches";
import type Cachos from "@/lib/Cachos";
import { Arreglos, con, existe, exito, justo, pipa, type Quiza, type Resultado, usando } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";
import { type ErrorAlAsignarEventos, Registro } from "./Registro";

export default usando(new Caracteristica("Registros de usuarios"), c => {
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

	protected override asignarEventos(): Resultado<Quiza<string[]>, ErrorAlAsignarEventos> {
		const eventos: string[] = [];

		eventos.push(`${this.miembro} se unió al servidor`);

		return pipa(eventos, justo, exito);
	}
}

class MiembroSeFue extends RegistroDeUsuario {
	constructor(private readonly miembro: GuildMember | PartialGuildMember) {
		super();
	}

	protected override asignarEventos(): Resultado<Quiza<string[]>, ErrorAlAsignarEventos> {
		const eventos: string[] = [];

		eventos.push(`${this.miembro} se fue del servidor`);

		return pipa(eventos, justo, exito);
	}
}

class MiembroActualizado extends RegistroDeUsuario {
	constructor(
		private readonly miembroAntiguo: GuildMember | PartialGuildMember,
		private readonly miembroNuevo: GuildMember,
	) {
		super();
	}

	protected override asignarEventos(): Resultado<Quiza<string[]>, ErrorAlAsignarEventos> {
		const eventos: string[] = [];

		con(existe(this.miembroAntiguo.nickname), existe(this.miembroNuevo.nickname), (apodoAntiguo, apodoNuevo) => {
			if (!apodoAntiguo.existe && apodoNuevo.existe)
				eventos.push(`${this.miembroNuevo} se puso el apodo ${inlineCode(apodoNuevo.valor)}`);

			if (apodoAntiguo.existe && !apodoNuevo.existe) eventos.push(`${this.miembroNuevo} se quitó el apodo`);

			if (apodoAntiguo.existe && apodoNuevo.existe && apodoAntiguo.valor !== apodoNuevo.valor)
				eventos.push(
					`${this.miembroNuevo} se cambió el apodo, de ${inlineCode(apodoAntiguo.valor)} a ${inlineCode(apodoNuevo.valor)}`,
				);
		});

		con(existe(this.miembroAntiguo.avatarURL()), existe(this.miembroNuevo.avatarURL()), (avatarAntiguo, avatarNuevo) => {
			if (!avatarAntiguo.existe && avatarNuevo.existe)
				eventos.push(`${this.miembroNuevo} se puso el avatar de servidor: ${inlineCode(avatarNuevo.valor)}`);

			if (avatarAntiguo.existe && !avatarNuevo.existe) eventos.push(`${this.miembroNuevo} se quitó el avatar de servidor`);

			if (avatarAntiguo.existe && avatarNuevo.existe && avatarAntiguo.valor !== avatarNuevo.valor)
				eventos.push(
					`${this.miembroNuevo} se cambió el avatar de servidor, de ${inlineCode(avatarAntiguo.valor)} por ${inlineCode(avatarNuevo.valor)}`,
				);
		});

		con(
			existe(this.miembroAntiguo.user.avatarURL()),
			existe(this.miembroNuevo.user.avatarURL()),
			(avatarAntiguo, avatarNuevo) => {
				if (!avatarAntiguo.existe && avatarNuevo.existe)
					eventos.push(`${this.miembroNuevo} se puso el avatar ${inlineCode(avatarNuevo.valor)}`);

				if (avatarAntiguo.existe && !avatarNuevo.existe) eventos.push(`${this.miembroNuevo} se quitó el avatar`);

				if (avatarAntiguo.existe && avatarNuevo.existe && avatarAntiguo.valor !== avatarNuevo.valor)
					eventos.push(
						`${this.miembroNuevo} se cambió el avatar, de ${inlineCode(avatarAntiguo.valor)} por ${inlineCode(avatarNuevo.valor)}`,
					);
			},
		);

		con(existe(this.miembroAntiguo.bannerURL()), existe(this.miembroNuevo.bannerURL()), (cartelAntiguo, cartelNuevo) => {
			if (!cartelAntiguo.existe && cartelNuevo.existe)
				eventos.push(`${this.miembroNuevo} se puso el cartel de servidor ${inlineCode(cartelNuevo.valor)}`);

			if (cartelAntiguo.existe && !cartelNuevo.existe) eventos.push(`${this.miembroNuevo} se quitó el cartel de servidor`);

			if (cartelAntiguo.existe && cartelNuevo.existe && cartelAntiguo.valor !== cartelNuevo.valor)
				eventos.push(
					`${this.miembroNuevo} se cambió el cartel de servidor, de ${inlineCode(cartelAntiguo.valor)} por ${inlineCode(cartelNuevo.valor)}`,
				);
		});

		con(
			existe(this.miembroAntiguo.user.bannerURL()),
			existe(this.miembroNuevo.user.bannerURL()),
			(cartelAntiguo, cartelNuevo) => {
				if (!cartelAntiguo.existe && cartelNuevo.existe)
					eventos.push(`${this.miembroNuevo} se puso el cartel ${codeBlock(cartelNuevo.valor)}`);

				if (cartelAntiguo.existe && !cartelNuevo.existe) eventos.push(`${this.miembroNuevo} se quitó el cartel`);

				if (cartelAntiguo.existe && cartelNuevo.existe && cartelAntiguo.valor !== cartelNuevo.valor)
					eventos.push(
						`${this.miembroNuevo} se cambió el cartel, de ${codeBlock(cartelAntiguo.valor)} por ${codeBlock(cartelNuevo.valor)}`,
					);
			},
		);

		con(this.miembroAntiguo.user.username, this.miembroNuevo.user.username, (nombreAntiguo, nombreNuevo) => {
			if (nombreAntiguo !== nombreNuevo)
				eventos.push(
					`${this.miembroNuevo} cambió su nombre de usuario, de ${inlineCode(nombreAntiguo)}, por ${inlineCode(nombreNuevo)}`,
				);
		});

		con(this.miembroAntiguo.roles.cache, this.miembroNuevo.roles.cache, (rolesAntiguos, rolesNuevos) => {
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
				eventos.push(
					`${this.miembroNuevo} obtuvo los roles ${pipa(
						constructorDeRolesAgregados,
						Arreglos.map(s => `- ${s}`),
						Arreglos.unir("\n"),
					)}`,
				);

			if (constructorDeRolesEliminados.length !== 0)
				eventos.push(
					`${this.miembroNuevo} perdió los roles ${pipa(
						constructorDeRolesEliminados,
						Arreglos.map(s => `- ${s}`),
						Arreglos.unir("\n"),
					)}`,
				);
		});

		return pipa(eventos, justo, exito);
	}
}
