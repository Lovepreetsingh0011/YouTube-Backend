import multer from "multer";
// import {} from "../../Public/Temp";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Public");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const Upload = multer({ storage: storage });
