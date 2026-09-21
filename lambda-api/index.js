const dns = require('dns').promises;

exports.handler = async (event) => {
  const host = process.env.DB_HOST;

  const resolver = new dns.Resolver();
  resolver.setServers(['172.31.0.2']);

  const resultado = {
    servidorDNS: '172.31.0.2',
    host
  };

  try {
    resultado.A = {
      ok: true,
      datos: await resolver.resolve4(host)
    };
  } catch (error) {
    resultado.A = {
      ok: false,
      codigo: error.code || null,
      error: error.message
    };
  }

  try {
    resultado.CNAME = {
      ok: true,
      datos: await resolver.resolveCname(host)
    };
  } catch (error) {
    resultado.CNAME = {
      ok: false,
      codigo: error.code || null,
      error: error.message
    };
  }

  try {
    resultado.SOA = {
      ok: true,
      datos: await resolver.resolveSoa('rds.amazonaws.com')
    };
  } catch (error) {
    resultado.SOA = {
      ok: false,
      codigo: error.code || null,
      error: error.message
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(resultado)
  };
};