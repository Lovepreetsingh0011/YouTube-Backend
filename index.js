import { ConnectDb } from "./Src/Db.js";
import { app } from "./Src/App.js";
import "dotenv/config";

ConnectDb()
  .then(() => {
    app.listen(process.env.PORT || 6000, () => {
      console.log(`App is Listen At Port : ${process.env.PORT} `);
    });
  })
  .catch(() => {
    console.log("Faild Connection with database");
  });
