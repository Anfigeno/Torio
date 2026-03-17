import registro from "@/configuracion/registro";
import { Caracteristica, ManejadorDeEvento } from "@/Torio";

export const autenticado = new Caracteristica("Autenticado");

autenticado.agregarManejadorDeEvento(
	new ManejadorDeEvento("clientReady", (_, cliente) => {
		registro.info(`Bot eutenticado como ${cliente.user.username}`);
	}),
);

export default autenticado;
