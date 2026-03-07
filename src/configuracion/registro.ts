import pino from "pino";

const registro = pino({ transport: { target: "pino-pretty" } });

export default registro;
