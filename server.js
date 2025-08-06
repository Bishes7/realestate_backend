import express from "express";

const app = express();
const PORT = 8000;

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Sever is running at http://localhost:${PORT}`);
});
