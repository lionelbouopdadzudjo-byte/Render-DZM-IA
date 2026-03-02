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
  res.send("Serveur DZM IA actif")
})

// =============================
// INSERTION PAIEMENT
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

    console.log("=== PAYLOAD RECU ===")
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

    console.log("=== STATUS SUPABASE ===")
    console.log(response.status)

    console.log("=== REPONSE SUPABASE ===")
    console.log(data)

    res.status(response.status).send(data)

  } catch (error) {

    console.log("=== ERREUR SERVEUR ===")
    console.log(error.message)

    res.status(500).json({
      error: error.message
    })
  }

})

// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})
