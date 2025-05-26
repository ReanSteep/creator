"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_1 = __importDefault(require("fastify"));
const server = (0, fastify_1.default)();
server.register(cors_1.default, { origin: true });
server.get('/health', async () => {
    return { status: 'ok' };
});
const PORT = Number(process.env.PORT) || 3000;
server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
