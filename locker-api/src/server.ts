import app from "./app";
import "./polyfills/objectHasOwn";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
