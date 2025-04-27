import type { Metadata } from 'next'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../styles/Home.module.css';
import { BuyerPanel } from '../components/BuyerPanel';
import { SellerPanel } from '../components/SellerPanel';

export const metadata: Metadata = {
  title: 'EscroDot',
  description: 'EscroDot',
}

const Home = () => {
  return (
    <div className={styles.container}>
      

      <main className={styles.main}>
        <ConnectButton />
        <h1 className={styles.title}>EscroDot Demo</h1>
        <SellerPanel />
        <BuyerPanel />
      </main>
    </div>
  );
};

export default Home;
