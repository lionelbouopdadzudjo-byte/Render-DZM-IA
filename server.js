import express from "express"
import fetch from "node-fetch"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// =============================
// ROUTE TEST
// =============================
app.get("/", (req, res) => {
  res.send("DZM IA Backend actif")
})


// =============================
// ROUTE OCR
// =============================
app.post("/ocr", async (req, res) => {

  try {

    const { image_url } = req.body

    if (!image_url) {
      return res.status(400).json({
        error: "Image URL manquante"
      })
    }

    console.log("=== OCR IMAGE URL ===")
    console.log(image_url)

    // Télécharger l'image
    const imageResponse = await fetch(image_url)
    const buffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString("base64")

    // Appel Google Vision
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: "TEXT_DETECTION" }]
            }
          ]
        })
      }
    )

    const visionData = await visionResponse.json()

    console.log("=== GOOGLE RESPONSE ===")
    console.log(JSON.stringify(visionData))

    const extractedText =
      visionData.responses?.[0]?.fullTextAnnotation?.text || null

    if (!extractedText) {
      return res.json({
        success: false,
        text: null
      })
    }

    return res.json({
      success: true,
      text: extractedText
    })

  } catch (error) {

    console.log("=== OCR ERROR ===")
    console.log(error.message)

    return res.status(500).json({
      success: false,
      error: error.message
    })

  }

})


// =============================
// ROUTE INSERTION SUPABASE
// =============================
app.post("/insert-paiement", async (req, res) => {

  try {

    const {
      transaction_id,
      montant,
      numero,
      beneficiaire,
      mode_paiement,
      date_transaction
    } = req.body

    const payload = {
      transaction_id,
      montant,
      numero,
      beneficiaire,
      mode_paiement,
      date_transaction
    }

    console.log("=== PAYLOAD INSERTION ===")
    console.log(payload)

    const response = await fetch(
      "https://mvuerkeshsjoxvkwlz.supabase.co/rest/v1/paiements",
      {
        method: "POST",
        headers: {
          "apikey": process.env.SUPABASE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(payload)
      }
    )

    const data = await response.text()

    console.log("=== SUPABASE STATUS ===")
    console.log(response.status)

    console.log("=== SUPABASE RESPONSE ===")
    console.log(data)

    return res.status(response.status).send(data)

  } catch (error) {

    console.log("=== INSERT ERROR ===")
    console.log(error.message)

    return res.status(500).json({
      error: error.message
    })

  }

})


// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Serveur démarré sur port ${PORT}`)
})
