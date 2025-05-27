import Fastify from 'fastify';

const app = Fastify();

app.get('/', async (request, reply) => {
  return { status: 'ok' };
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
}); 