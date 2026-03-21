import z from "zod";

const EsquemaDeVariablesDeEntorno = z.object({
	CLAVE_DEL_BOT: z.string(),
	ID_DEL_BOT: z.string(),
	ID_DEL_SERVIDOR: z.string(),
});

EsquemaDeVariablesDeEntorno.parse(process.env);

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof EsquemaDeVariablesDeEntorno> {}
	}
}
