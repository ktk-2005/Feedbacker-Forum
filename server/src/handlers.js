/*
  Catch Errors Handler
  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch and errors they throw, and pass it along to our express middleware with next()

  Not in use yet
  exports.catchErrors = (f) => {
    return function(req, res, next) {
      return f(req, res, next).catch(next)
    }
  }

*/

/*
  Not Found Error Handler
  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
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
module.exports.devErr = (err, req, res, next) => {
  console.log(err.stack)
  const errorDetails = {
    message: err.message,
    status: err.status,
    stack: err.stack,
  }
  res.status(err.status || 500)
  res.send(errorDetails)
}

/*
  Production Error Hanlder
  No stacktraces are leaked to user
*/
module.exports.prodErr = (err, req, res, next) => {
  res.status(err.status || 500)
  res.json({'errors': {
    message: err.message,
    error: {},
  }})
}
