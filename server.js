const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/ocr", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      "fra"
    );

    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      raw_text: text
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "OCR failed"
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("DZM OCR server running");
});
