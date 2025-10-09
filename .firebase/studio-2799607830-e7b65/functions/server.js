const { onRequest } = require('firebase-functions/v2/https');
  const server = import('firebase-frameworks');
  exports.ssrstudio2799607830e7b6 = onRequest({}, (req, res) => server.then(it => it.handle(req, res)));
  