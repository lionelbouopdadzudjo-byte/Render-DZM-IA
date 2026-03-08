const express = require("express")
const axios = require("axios")
const Tesseract = require("tesseract.js")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json({ limit: "10mb" }))

app.get("/", (req, res) => {
 res.send("DZM OCR Server is running")
})

app.get("/ping", (req, res) => {
 res.json({ status: "OK" })
})

/*
OCR ENDPOINT
Botpress envoie :
{
 image_url:"https://..."
}
*/

app.post("/ocr", async (req, res) => {

 try {

  const imageUrl = req.body.image_url

  if (!imageUrl) {
   return res.status(400).json({
    success:false,
    error:"No image URL provided"
   })
  }

  console.log("Image reçue :", imageUrl)

  const response = await axios.get(imageUrl, {
   responseType:"arraybuffer"
  })

  const imageBuffer = Buffer.from(response.data, "binary")

  const result = await Tesseract.recognize(
   imageBuffer,
   "fra",
   {
    logger:m => console.log(m)
   }
  )

  const text = result.data.text

  console.log("OCR TEXT :", text)

  res.json({
   success:true,
   raw_text:text
  })

 } catch(error){

  console.error("OCR ERROR :", error)

  res.status(500).json({
   success:false,
   error:error.message
  })

 }

})

app.listen(process.env.PORT || 3000, () => {
 console.log("DZM OCR server running")
})
