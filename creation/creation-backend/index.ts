import Fastify from 'fastify'

const app = Fastify()

app.get('/', async (req, reply) => {
  return { hello: 'creation-backend' }
})

app.listen({ port: 3001 }, err => {
  if (err) throw err
  console.log('Server listening on http://localhost:3001')
})
