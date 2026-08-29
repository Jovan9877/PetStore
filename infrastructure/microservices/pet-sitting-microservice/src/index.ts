import app from "./app";
const port = process.env.PORT ?? 6979;
app.listen(port, () => console.log(`Pet sitting microservice is running on port ${port}`));
