/**
 * Async Handler Wrapper
 * Wraps async route handlers to automatically catch errors and pass them to next()
 * Detta eliminerar behovet av try-catch-block i varje controller
 * 
 * Usage:
 * router.get('/songs', catchAsync(async (req, res, next) => {
 *   const songs = await Song.find();
 *   res.json(songs);
 * }));
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
