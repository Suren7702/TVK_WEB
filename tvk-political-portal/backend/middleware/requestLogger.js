export default function requestLogger(req, res, next) {
  try {
    console.log(">>> Incoming:", req.method, req.originalUrl);
    console.log("    Headers:", {
      host: req.headers.host,
      origin: req.headers.origin,
      "content-type": req.headers["content-type"],
      "x-api-key": req.headers["x-api-key"] ? "[present]" : "[missing]",
      authorization: req.headers.authorization ? "[present]" : "[missing]",
    });

    if (req.body && Object.keys(req.body).length) {
      const bodyPreview = JSON.stringify(req.body).slice(0, 500);
      console.log("    Body:", bodyPreview);
    } else {
      console.log("    Body: (empty or not parsed)");
    }
  } catch (err) {
    console.log("Logger error:", err.message);
  }
  next();
}
