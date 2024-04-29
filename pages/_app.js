import "../styles/globals.css";

import merge from "lodash.merge";
import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  midnightTheme,
} from "@rainbow-me/rainbowkit";

import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
// import { WagmiConfig, createConfig, configureChains, createClient,  } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { mainnet, sepolia } from "wagmi/chains";


// const { chains, provider } = configureChains(
//   [mainnet, sepolia],
//   [
//     jsonRpcProvider({
//       rpc: (chain) => ({
//         http: process.env.SEPOLIA_URL
//       }, {}),
//     }),
//   ],
//   // [
//   //   alchemyProvider({
//   //     apiKey: "Bo6xfqVoNoZ_d8432vKgPwDRiPpHJdpU",
//   //   }),
//   // ]
// );

const { chains, provider } = configureChains(
  [sepolia],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: "https://eth-sepolia.g.alchemy.com/v2/Bo6xfqVoNoZ_d8432vKgPwDRiPpHJdpU", 
      }),
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Jude DEFi",
  chains,
});

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
});

// const config = createClient({
//   autoConnect: true,
//   publicClient,
//   connectors: [
//     new InjectedConnector({
//       chains,
//       options: {
//         name: "Injected",
//         shimDisconnect: true,
//       },
//     }),
//   ],
// });

const myTheme = merge(midnightTheme(), {
  colors: {
    accentColor: "#18181b",
    accentColorForeground: "#fff",
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={myTheme}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
