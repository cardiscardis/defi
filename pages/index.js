'use client';
import React, { useState } from 'react';
import Header from '../components/Header'
import SwapComponent from '../components/SwapComponent'
import TradingViewWidget from "../components/TradingView";
import { NavItems } from "../components/NavItems";


export default function Home() {
  const [currentSelection, setCurrentSelection] = useState('Swap')
  console.log("selectedNavItem is:",currentSelection);
  const Swapper = ()=>{
    if (currentSelection == "Trading View") {
         return <TradingViewWidget />;
       } else return <SwapComponent />;
       

  }
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#2D242F]">
      <Header currentSelection={currentSelection} setCurrentSelection={setCurrentSelection} />
      <Swapper />
      {/* <SwapComponent /> */}
    </div>
  );
}
