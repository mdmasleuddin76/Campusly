// Safety net for errors the controllers don't handle themselves.
// Known errors (missing fields, wrong password...) are answered directly in the controllers.
// This only catches the unexpected ones: bad JSON body, DB down, a bug.
// Without it, Express sends an HTML error page instead of JSON.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Request body is not valid JSON
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON in request body" });
  }
  // Bad MongoDB id in the URL, e.g. /api/tpo/users/123
  if (err.name === "CastError") {
    const message = err.path === "_id" ? "Invalid id" : `Invalid value for ${err.path}`;
    return res.status(400).json({ success: false, message });
  }
  // Schema rule broken (wrong enum value, number out of range...)
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ success: false, message });
  }
  // Duplicate key (e.g. same email registered at the same moment)
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate value", field: Object.keys(err.keyValue)[0] });
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Something went wrong" });
};

export default errorHandler;
