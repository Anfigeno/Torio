import { Events, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import registro from "@/configuracion/registro";
import { Arreglos, con, ErrorBase, existe, intentar, mapearQuiza, pipa, usando } from "@/lib/Funci";
import { Caracteristica } from "@/lib/Torio";

export const limpiar = usando(new Caracteristica("Limpiar"), c => {
	const COMANDO = {
		nombre: "limpiar",
		opciones: { cantidad: "cantidad-de-mensajes" },
	} as const;

	c.agregarComando(
		new SlashCommandBuilder()
			.setName(COMANDO.nombre)
			.setDescription("Elimina varios mensajes")
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
			.addNumberOption(o =>
				o
					.setName(COMANDO.opciones.cantidad)
					.setMinValue(1)
					.setMaxValue(50)
					.setDescription("Cantidad de mensajes a borrar")
					.setRequired(true),
			),
	);

	c.agregarManejadorDeEvento(Events.InteractionCreate, async interaccion => {
		if (!interaccion.isChatInputCommand() || interaccion.commandName !== COMANDO.nombre) return;

		const inicioDelComando = Date.now();

		const { ok: sePospusoLaRespuesta, error: errorAlPosponerLaRespuesta } = await intentar({
			accion: () => interaccion.deferReply({ flags: ["Ephemeral"] }),
			atrapar: e => new ErrorBase({ mensaje: "No se pudo posponer la respuesta", errorBase: e }),
		});

		if (!sePospusoLaRespuesta) {
			registro.error(errorAlPosponerLaRespuesta);
			return;
		}

		const { existe: hayCanal, valor: canal } = existe(interaccion.channel);

		if (!hayCanal) {
			registro.error(new ErrorBase({ mensaje: "No hay canal" }));
			return;
		}

		const {
			ok: seObtuvoLaOpcion,
			valor: quizaOpcionCantidad,
			error,
		} = intentar({
			accion: () => pipa(COMANDO.opciones.cantidad, c => interaccion.options.getNumber(c, true), existe),
			atrapar: e => new ErrorBase({ mensaje: "No se pudo obtener la opcion", errorBase: e }),
		});

		if (!seObtuvoLaOpcion) {
			registro.error(error);
			return;
		}

		const { existe: hayOpcionCantidad, valor: cantidadDeMensajes } = quizaOpcionCantidad;

		if (!hayOpcionCantidad) {
			registro.error(new ErrorBase({ mensaje: "No hay la opción cantidad" }));
			return;
		}

		const {
			ok: seObtuvieronLosMensajes,
			valor: quizaMensajes,
			error: errorAlObtenerMensajes,
		} = await intentar({
			accion: async () =>
				pipa(
					await canal.messages.fetch({ limit: cantidadDeMensajes }),
					existe,
					mapearQuiza(mensajes => mensajes.toJSON()),
				),
			atrapar: e => new ErrorBase({ mensaje: "No se pudieron obtener los mensajes", errorBase: e }),
		});

		if (!seObtuvieronLosMensajes) {
			registro.error(errorAlObtenerMensajes);
			return;
		}

		const { existe: hayMensajes, valor: mensajes } = quizaMensajes;

		if (!hayMensajes) {
			registro.error(new ErrorBase({ mensaje: "No hay mensajes" }));
			return;
		}

		const { existe: hayErroresAlEliminarMensajes, valor: erroresAlEliminarMensajes } = await pipa(
			mensajes,
			Arreglos.map(mensaje =>
				intentar({
					accion: () => mensaje.delete(),
					atrapar: e => new ErrorBase({ mensaje: "No se pudo eliminar un mensaje", errorBase: e }),
				}),
			),
			p => Promise.all(p),
			async p =>
				con(await p, resultados =>
					pipa(
						resultados,
						Arreglos.filtrar(resultado => !resultado.ok),
						Arreglos.map(resultado => resultado.error),
						existe,
					),
				),
		);

		let respuesta: string;

		if (hayErroresAlEliminarMensajes) {
			for (const error of erroresAlEliminarMensajes) {
				registro.error(error);
			}

			respuesta = "Ocurrió un error al ejecutar este comando. Por favor, avisa a un administrador lo más pronto posible.";
		}

		respuesta = `Se ${cantidadDeMensajes === 1 ? `eliminó 1 mensaje` : `eliminaron ${cantidadDeMensajes} mensajes`} en ${(Date.now() - inicioDelComando) / 1000} segundos`;

		const { ok: seRespondio, error: errorAlResponder } = await intentar({
			accion: () => interaccion.editReply(respuesta),
			atrapar: e => new ErrorBase({ mensaje: "No se pudo responder la interaccion", errorBase: e }),
		});

		if (!seRespondio) registro.error(errorAlResponder);
	});
});
