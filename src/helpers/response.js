/**
 * Response middleware for the application, which is a single point file which is responsible to respond to HTTP request for success and errors
 */

const success = (req, res, next) => {
  if (!req.route) {
    return next (new Error('404'));
  }

  const status = res.locals.status || 200;
  return res.status(status).send({ data: res.locals.data });
};

const error = (err, req, res, next) => {
  let errorMessage = 'Something Went Wrong';
  let statusCode = 500;
  if (err.message === '404') {
    return res.status(404).send(`Requested URL ${req.protocol + '://' + req.get('host') + req.originalUrl} not found`);
  } else if (typeof err === 'string') {
    errorMessage = err;
    statusCode = 400;
  } else {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(statusCode).send({ error: errorMessage });
};

module.exports = { error, success };
