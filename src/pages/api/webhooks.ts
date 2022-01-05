import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from "stream"
import Stripe from "stripe"
import { stripe } from "../../services/stripe"
import { saveSubscription } from "./_lib/manegaSubscriptions"

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
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
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

      try {
        switch (type) {

          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription
            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
            )
            break

          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            )

            break
          default:
            throw new Error('Unhandled Event')
        }
      } catch (err) {
        return res.json({ error: 'Webhook handler failed' })
      }
    }

    res.json({ ok: true })
  } else {

    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')

  }
}
