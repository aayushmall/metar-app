const success = (req, res, next) => {
  if (!req.route) {
    return next (new Error('404'));
  }

  const status = res.locals.status || 200;
  return res.status(status).send({ data: res.locals.data });
};

const error = (err, req, res, next) => {
  let errorMessage = 'Something Went Wrong';
  if (err.message === '404') {
    return res.status(404).send(`Requested URL ${req.protocol + '://' + req.get('host') + req.originalUrl} not found`);
  } else if (typeof err === 'string') {
    errorMessage = err;
  } else {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(500).send({ error: errorMessage });
};

module.exports = { error, success };
