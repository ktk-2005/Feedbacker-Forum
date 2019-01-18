/*
  Catch Errors Handler
  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch and errors they throw,
  and pass it along to our express middleware with next()
*/

module.exports.catchErrors = fn => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    next(error)
  }
}

/*
  Not Found Error Handler
  If we hit a route that is not found,
   we mark it as 404 and pass it along to
   the next error handler to display
*/
module.exports.notFound = (req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
}

/*
  Development Error Hanlder
  log error stack trace
*/
// eslint-disable-next-line no-unused-vars
module.exports.devErr = (err, req, res, next) => {
  console.error(err)
  const errorDetails = {
    message: err.message,
    status: err.status,
    stack: err.stack,
  }
  res.status(err.status || 500)
  res.json(errorDetails)
}

/*
  Production Error Hanlder
  No stacktraces are leaked to user
*/
// eslint-disable-next-line no-unused-vars
module.exports.prodErr = (err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500)
  res.json({
    errors: {
      message: err.message,
      error: { },
    },
  })
}
