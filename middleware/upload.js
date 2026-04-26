const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "task_manager_files",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "docx"],
    resource_type: "auto",
  },
});

const upload = multer({ storage });

module.exports = upload;