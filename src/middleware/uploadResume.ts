import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req : any, _file : any, cb : any) => cb(null, uploadDir),
  filename: (_req : any, file : any, cb : any) => cb(null, `${Date.now()}-${file.originalname}`),
});

const resumeFilter: any = (_req: any, file: any, cb: any) => {
  const allowedExt = /\.(pdf|doc|docx)$/i;
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (allowedExt.test(file.originalname) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .pdf, .doc, and .docx files are allowed!"));
  }
};


const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter : resumeFilter,
});

export default upload;
