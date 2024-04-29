import React, { useState } from "react";
import { ArrowSmUpIcon } from "@heroicons/react/outline";

const NavItems = (props) => {
  const SWAP = "Swap";
  const CHART = "Chart";
  const TRADE = "Trade";
  const UNISWAP = "Uniswap";
  const { currentSelection, setCurrentSelection } = props

  console.log(currentSelection);
  return (
    <div className="bg-zinc-900 h-fit flex items-center justify-around rounded-full mx-6">
      <button
        className={getNavIconClassName(SWAP)}
        onClick={() => setCurrentSelection(SWAP)}
      >
        {SWAP}
      </button>
      <a
        className={getNavIconClassName('Trading View')}
        onClick={() => setCurrentSelection('Trading View')}
      >
        {CHART}
      </a>
      <button
        className={getNavIconClassName(TRADE)}
        onClick={() => setCurrentSelection(TRADE)}
      >
        {TRADE}
      </button>
      <button
        className={getNavIconClassName(UNISWAP)}
        onClick={() => window.open("https://info.uniswap.org/#/", "_blank")}
      >
        {UNISWAP}
        <ArrowSmUpIcon className="h-4 rotate-45" />
      </button>
    </div>
  );

  function getNavIconClassName(name) {
    let className =
      "p-1 px-4 cursor-pointer border-[4px] border-transparent flex items-center";
    className +=
      name === currentSelection
        ? " bg-zinc-800 border-zinc-900 rounded-full"
        : "";
    return className;
  }
};

export default NavItems;
