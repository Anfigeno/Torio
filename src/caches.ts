import type { GuildTextBasedChannel } from "discord.js";
import ConfiguracionDeDiscord from "./configuracion/Discord";
import registro from "./configuracion/registro";
import Cachos from "./lib/Cachos";
import { con, ErrorBase, exito, fallo, intentar } from "./lib/Funci";
import torio from "./torio";

const crearCacheDeCanalDeTexto = (id: string, nombre: string) =>
	con(new Cachos<GuildTextBasedChannel, ErrorAlObtenerCanal>(1000 * 60 * 5), (c) => {
		c.enActualizacion(() => registro.info(`Actualizando cache del canal "${nombre}"`));

		c.enFallo((error) => registro.error(error));

		c.establecerActualizador(async () => {
			const {
				ok: seObtuvoElCanal,
				valor: canal,
				error,
			} = await intentar({
				accion: () => torio.cliente.channels.fetch(id),
				atrapar: (e) => new ErrorAlObtenerCanal({ mensaje: `No se pudo obtener el canal [${nombre}]`, errorBase: e }),
			});

			if (!seObtuvoElCanal) return fallo(error);

			if (!canal) return fallo(new ErrorAlObtenerCanal({ mensaje: `El canal [${nombre}] no existe o no se pudo obtener` }));

			if (!canal.isTextBased())
				return fallo(new ErrorAlObtenerCanal({ mensaje: `El canal [${nombre}] no es un canal de texto` }));

			if (canal.isDMBased())
				return fallo(new ErrorAlObtenerCanal({ mensaje: `El canal [${nombre}] no es un canal de servidor` }));

			if (!canal.isSendable())
				fallo(new ErrorAlObtenerCanal({ mensaje: `No se pueden enviar mensajes en el canal [${nombre}]` }));

			return exito(canal);
		});

		return c;
	});

export class ErrorAlObtenerCanal extends ErrorBase {}

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
