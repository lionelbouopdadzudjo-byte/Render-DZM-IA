const express = require("express");
const axios = require("axios");
const Tesseract = require("tesseract.js");

const app = express();
app.use(express.json());

app.post("/ocr", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "No image URL provided"
      });
    }

    // Télécharger l'image en buffer
    const response = await axios.get(image, {
      responseType: "arraybuffer"
    });

    const imageBuffer = Buffer.from(response.data, "binary");

    // Lancer OCR
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
