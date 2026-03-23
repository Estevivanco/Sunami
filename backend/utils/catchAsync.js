/**
 * Async Handler Wrapper
 * Omsluter asynkrona route handlers för att automatiskt fånga fel och skicka till next()
 * Detta eliminerar behovet av try-catch-block i varje controller
 * 
 * Användning:
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
