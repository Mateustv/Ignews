import Head from 'next/head'
import { GetStaticProps } from 'next'
// import{GetServerSideProps} from 'next'

import { SubscribeButton } from '../components/SubscribeButton'
import styles from './home.module.scss'
import { stripe } from '../services/stripe'

interface ProductProps {
  product: {
    priceId: string,
    amount: number,
  };
}

export default function Home({ product }: ProductProps) {
  return (
    <>
      <Head>
        <title>Home | Ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero} >
          <span><span>👏</span> Hey, welcome!</span>
          <h1>
            News about <br />
            the <span>React</span> world
          </h1>
          <p>
            Get acess to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        <img src="/images/avatar.svg" alt="Girl Conding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const price = await stripe.prices.retrieve('price_1JzlTaDVkuDPuR5SZqCMkBTY', {
    expand: ['product'],
  })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-Us', { style: 'currency', currency: 'USD' }).format(price.unit_amount / 100),
  }

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24  //24 horas
  }
}