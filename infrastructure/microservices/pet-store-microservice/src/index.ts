import app from "./app";

const port = process.env.PORT ?? 6868;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Pet store microservice is running on port ${port}`);
});
