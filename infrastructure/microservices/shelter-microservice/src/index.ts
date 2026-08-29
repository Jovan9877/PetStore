import app from "./app";
const port = process.env.PORT ?? 7080;
app.listen(port, () => console.log(`Shelter microservice is running on port ${port}`));
