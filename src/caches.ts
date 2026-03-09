import type { GuildTextBasedChannel } from "discord.js";
import cliente from "./cliente";
import ConfiguracionDeDiscord from "./configuracion/Discord";
import registro from "./configuracion/registro";
import Cachos from "./lib/Cachos";
import { Funci } from "./lib/Funci";

export class ErrorAlObtenerCanal extends Error {
	constructor(
		mensaje: string,
		public readonly errorBase?: unknown,
	) {
		super(mensaje);
		this.name = "ErrorAlObtenerCanal";
	}
}

const crearCacheDeCanalDeTexto = (id: string, nombre: string) =>
	Funci.con(new Cachos<GuildTextBasedChannel>(1000 * 60 * 5), (c) => {
		c.enActualizacion(() => registro.info(`Actualizando cache del canal "${nombre}"`));

		c.enFallo((error) => registro.error(error));

		c.establecerActualizador(async () => {
			const resultado = await Funci.atrapar(() => cliente.channels.fetch(id));

			if (!resultado.ok)
				return Funci.fallo(
					new ErrorAlObtenerCanal(
						`No se pudo obtener el canal [${nombre}]`,
						resultado.error,
					),
				);

			const canal = resultado.valor;

			if (!canal)
				return Funci.fallo(
					new ErrorAlObtenerCanal(`El canal [${nombre}] no existe o no se pudo obtener`),
				);

			if (!canal.isTextBased())
				return Funci.fallo(
					new ErrorAlObtenerCanal(`El canal [${nombre}] no es un canal de texto`),
				);

			if (canal.isDMBased())
				return Funci.fallo(
					new ErrorAlObtenerCanal(`El canal [${nombre}] no es un canal de servidor`),
				);

			if (!canal.isSendable())
				Funci.fallo(
					new ErrorAlObtenerCanal(`No se pueden enviar mensajes en el canal [${nombre}]`),
				);

			return Funci.exito(canal);
		});

		return c;
	});

export const canalDeRegistrosDeCanalesDeTexto = crearCacheDeCanalDeTexto(
	ConfiguracionDeDiscord.canales.moderacion.registros.canalesDeTexto,
	"registos de canales de texto",
);

export const canalDeRegistrosDeCanalesDeVoz = crearCacheDeCanalDeTexto(
	ConfiguracionDeDiscord.canales.moderacion.registros.canalesDeVoz,
	"registos de canales de voz",
);

export const canalDeRegistrosDeServidor = crearCacheDeCanalDeTexto(
	ConfiguracionDeDiscord.canales.moderacion.registros.servidor,
	"registos de servidor",
);

export const canalDeRegistrosDeUsuarios = crearCacheDeCanalDeTexto(
	ConfiguracionDeDiscord.canales.moderacion.registros.usuarios,
	"registos de usuarios",
);

export const canalDeRegistrosDeModeracion = crearCacheDeCanalDeTexto(
	ConfiguracionDeDiscord.canales.moderacion.registros.moderacion,
	"registos de moderacion",
);
