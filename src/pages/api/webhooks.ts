import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from "stream"
import Stripe from "stripe"
import { stripe } from "../../services/stripe"

// RECEBENDO OS DADOS VIA STREAMER //
async function buffer(readable: Readable) {
  const chucks = []

  for await (const chunk of readable) {
    chucks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chucks)
}
//CONFIGURANDO O NEXT PARA RECEBER DADOS VIA STREAM // 
export const config = {
  api: {
    bodyParser: false,
  }
}
//EVENTOS QUE QUERO MONITORAR //
const relevantEvents = new Set([
  'checkout.session.completed'
])

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if (req.method === "POST") {

    const buf = await buffer(req) //DADOS JA RECEBIDOS POR COMPLETO
    const secret = req.headers['stripe-signature']

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_SECRET)
    } catch (err) {
      res.status(500).send(`Webhook erro : ${err.message}`)
    }

    const { type } = event

    if (relevantEvents.has(type)) {
      console.log('evento recebido', event)
    }

    res.status(200).json({ ok: true })
  } else {

    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')

  }
}
