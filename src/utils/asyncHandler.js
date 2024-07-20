const asyncHandler = (reqhandlerFn) => {
  return (req, res, next) => {
    Promise.resolve(reqhandlerFn(req, res, next)).catch((err) => next(err));
  };
};
//accept a function and returns a function

export { asyncHandler };

// //high order functions ___ functions that operate on other functions, either by taking them as arguments or by returning them
// const asyncHandler = (func) => async (req, res, next) => {
//   try {
//     await func(req, res, next);
//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// };
