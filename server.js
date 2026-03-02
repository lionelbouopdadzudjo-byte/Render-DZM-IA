const express = require("express");
const axios = require("axios");
const Tesseract = require("tesseract.js");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Route test
app.get("/ping", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/ocr", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "No image URL provided"
      });
    }

    const response = await axios.get(image, {
      responseType: "arraybuffer"
    });

    const imageBuffer = Buffer.from(response.data, "binary");

    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      "fra"
    );

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
