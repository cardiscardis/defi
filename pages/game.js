import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useSearchParams } from 'next/navigation'
import divineCoinJson from './divine.json'
import { useRouter } from "next/router";

const contractAddress = '0xb39a34929b45d70af809e423189b7fb8593794c2';
const contractABI = divineCoinJson.abi

const Game = () => {
    const searchParams = useSearchParams()
    
    const referralLinkAddress = searchParams.get('link')

    const [divineCoin, setDivineCoin] = useState(null);
    const [balance, setBalance] = useState('0');
    const [isMining, setIsMining] = useState(false)
  const [score, setScore] = useState(0);
  const [tools, setTools] = useState(0);
  /* const [sources, setSources] = useState([
    { id: 1, offsetY: 300, cost: 0, coinsPerMinute: 1, image: 'vecteezy_cartoon-miner-with-shovel-and-pickaxe-in-the-ground_44651914.png' },
  ]); */
  const [sources, setSources] = useState([]);
  const [coins, setCoins] = useState([]);
  const [gamePaused, setGamePaused] = useState(false); // State for game pause
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar
  const coinsRef = useRef([]);
  const coinSoundRef = useRef(null); // Reference to coin sound audio element
  const backgroundMusicRef = useRef(null); // Reference to background music audio element
  const [receiverAddress, setReceiverAddress] = useState()

  const coinTypes = [
    { id: 1, value: 1, image: '/image-from-rawpixel-id-6542094-original.png', speedFactor: 1 },
    { id: 2, value: 2, image: '/Lovepik_com-380312887-crystal-button-mineral-lighting-effect-crystal-buttons-game-reality.png', speedFactor: 0.7 },
    { id: 3, value: 3, image: '/Lovepik_com-380312884-crystal-button-mineral-jewelry-stone-isolated-treasure.png', speedFactor: 0.5 },
    { id: 4, value: 4, image: '/Lovepik_com-380312883-mineral-light-effect-blue-jewelry-jewellery-button-miners.png', speedFactor: 0.3 },
  ];

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider('https://public-node.testnet.rsk.co');
    const signer2 = new ethers.Wallet('8295d8ae8aabfb6f2d8d971d0c0f99aba97aa2e490e4ccdfcdc0826aa82cf63b', provider);
    const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer2
    );
    setDivineCoin(contract);
    referralLinkAddress && referralLinkAddress !== signer2.addresss && handleMint(referralLinkAddress, '5')
  }, [])

  useEffect(() => {
    const storedScore = localStorage.getItem('score');
    const storedTools = localStorage.getItem('tools');
    if (storedScore) setScore(parseInt(storedScore, 10));
    if (storedTools) setTools(parseInt(storedTools, 10));

    requestAnimationFrame(animateCoins);
    initializeAudio();
  }, []);

  useEffect(() => {
    localStorage.setItem('score', score);
    localStorage.setItem('tools', tools);
  }, [score, tools]);

  useEffect(() => {
    const intervals = sources.map((source) => {
      return setInterval(() => {
        if (!gamePaused) {
          createCoin(source.offsetY, source.id);
        }
      }, 60000 / source.coinsPerMinute);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [sources, gamePaused]);

  const initializeAudio = () => {
    // Coin sound effect
    coinSoundRef.current = new Audio('/coin-flip-88793.mp3');
    coinSoundRef.current.load();

    // Background music
    backgroundMusicRef.current = new Audio('/video-game-music-loop-27629.mp3');
    backgroundMusicRef.current.loop = true; // Loop the background music
    backgroundMusicRef.current.volume = 1; // Adjust the volume (0.0 to 1.0)
    backgroundMusicRef.current.play();
  };

  const createCoin = (startPosY, sourceId) => {
    let selectedType;
    if (sourceId === 1) {
      // Free source can only mine the main coin type
      selectedType = coinTypes.find(type => type.id === 1);
    } else {
      // Paid sources can mine all types with adjusted probabilities
      var max = 10;
      var min = 1;
      var randomNumber = Math.floor((Math.random() * ((max + 1) - min)) + min);
      selectedType = coinTypes.find(type => randomNumber === type.id);
      if (!selectedType) {
        selectedType = coinTypes[0]; // Fallback to the main coin type if no type is selected
      }
    }

    const coin = {
      id: `coin-${Date.now()}-${Math.random()}`,
      type: selectedType,
      posX: window.innerWidth - 300,
      posY: startPosY - 100,
      phase: 1,
      t: 0,
      midX1: 300,
      midY1: startPosY - 100,
      midX2: 300,
      midY2: 50,
      destinationX: window.innerWidth - 300,
      destinationY: 50,
      shouldIncreaseScore: [1, 2, 3, 4].includes(selectedType.id), // All coins should increase score
    };
    coinsRef.current.push(coin);
    setCoins([...coinsRef.current]);

    // Play coin sound effect
    coinSoundRef.current.play();
  };

  const animateCoins = () => {
    coinsRef.current.forEach((coin, index) => {
      if (coin.t > 1) {
        coin.t = 0;
        coin.phase++;
        if (coin.phase > 3) {
          if (coin.shouldIncreaseScore) {
            updateScore(coin.type.value);
          }
          coinsRef.current.splice(index, 1);
          setCoins([...coinsRef.current]);
          return;
        }
      }

      let newX, newY;
      if (coin.phase === 1) {
        newX = coin.posX + (coin.midX1 - coin.posX) * coin.t;
        newY = coin.posY + (coin.midY1 - coin.posY) * coin.t;
      } else if (coin.phase === 2) {
        newX = coin.midX1 + (coin.midX2 - coin.midX1) * coin.t;
        newY = coin.midY1 + (coin.midY2 - coin.midY1) * coin.t;
      } else {
        newX = coin.midX2 + (coin.destinationX - coin.midX2) * coin.t;
        newY = coin.midY2 + (coin.destinationY - coin.midY2) * coin.t;
      }

      coin.posX = newX;
      coin.posY = newY;
      coin.t += 0.006 * coin.type.speedFactor; // Adjusted speed based on coin type
    });

    setCoins([...coinsRef.current]);
    requestAnimationFrame(animateCoins);
  };

  const updateScore = (scoreValue) => {
    setScore((prev) => prev + scoreValue + tools);
  };

  const addSource = (sourceNumber) => {
    if (!receiverAddress) {
        alert('You need to connect your wallet to play and earn.')
        return
    }
    if (balance <= 10) {
        alert('You do not have enough balance your wallet to play and earn. Go to https://divine-coin-miner.vercel.app/mine to earn some DIVINE coins.')
        return
    }
    if (tools >= 6) {
        alert('You cannot have more than 6 miners! Go to settings to reset game.')
        return
      }
    let image;
    switch (sourceNumber) {
      case 1:
        image = '/vecteezy_cartoon-miner-with-shovel-and-pickaxe-in-the-ground_44651914.png';
        break;
      case 2:
        image = '/Lovepik_com-401088916-mining-workers.png';
        break;
      case 3:
        image = '/Lovepik_com-401723709-working-coal-miners.png';
        break;
      case 4:
        image = '/png-transparent-caterpillar-inc-caterpillar-797f-haul-truck-die-cast-toy-mining-truck-dump-truck-vehicle-thumbnail.png';
        break;
      default:
        image = '/vecteezy_cartoon-miner-with-shovel-and-pickaxe-in-the-ground_44651914.png';
        break;
    }

    const newSource = {
      id: sourceNumber,
      offsetY: sources.length ? sources[sources.length - 1].offsetY + 100 : 300,
      cost: sourceNumber * 10,
      coinsPerMinute: sourceNumber * 5,
      image: image,
    };

    if (sourceNumber === 1 || score >= newSource.cost) {
      if (sourceNumber !== 1) setScore((prev) => prev - newSource.cost);
      setTools((prev) => prev + 1);
      setSources((prev) => [...prev, newSource]);
    }
  };

  const deleteSource = () => {
    if (sources.length > 1) {
      setSources((prev) => prev.slice(0, -1));
    }
  };

  const togglePause = () => {
    setGamePaused((prev) => !prev);
  };

  const resetScoreAndTools = () => {
    setScore(0);
    setTools(0);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };


  const playBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play();
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0; // Reset to the beginning
    }
  };


  async function addRSKTestnetNetwork() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x1F' }],
            });
        } catch (error) {
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x1F',
                            chainName: "RSK Testnet",
                            nativeCurrency: {
                                name: "tRBTC",
                                symbol: "tRBTC",
                                decimals: 18,
                            },
                            rpcUrls: ["https://public-node.testnet.rsk.co"],
                            blockExplorerUrls: ["https://explorer.testnet.rsk.co"],
                            iconUrls: [""],

                        }],
                    });
                } catch (addError) {
                    console.log('Did not add network');
                }
            }
        }
    }

    const copylink = (e) => {
        const url = `divine-coin-miner.vercel.app/game?link=${receiverAddress}`;
        // const links = base + share.asPath;
        navigator.clipboard.writeText(url)
        alert('Your referral link has been copied! You earn 5 ($308,756.65) DIV as a referral bonus when you refer')

    }

    const connectWallet = async () => {
        try {
            await addRSKTestnetNetwork()
            if (!window.ethereum) {
                alert('Please install MetaMask to use this dApp!');
                return
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress()
            setReceiverAddress(signerAddress);
            updateBalance(signerAddress, divineCoin);
        } catch (error) {
            console.error(error);
        }
    };

    const updateBalance = async (address, divineCoin) => {
        if (!divineCoin) {
            alert('error getting balance')
            return
        }
        try {
            const balanceInWei = await divineCoin.balanceOf(address);
            const balance = ethers.utils.formatUnits(balanceInWei, 'ether');
            setBalance(balance);
        } catch (error) {
            console.error(error);
        }
    };

const handleMint = async (address, amount) => {
    if (!divineCoin || !receiverAddress) {
        return
    }
        try {
            const amountInWei = ethers.utils.parseUnits(amount, 'ether');
            const tx = await divineCoin.mint(address, amountInWei);
            await tx.wait();
            updateBalance(receiverAddress, divineCoin);
        } catch (error) {
            console.error(error);
        }
    };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8" style={{
                backgroundImage: 'url(/background_18.png)'}}>
            <Header 
            balance={balance} 
            onConnect={receiverAddress ? copylink : connectWallet} 
            receiverAddress={receiverAddress}
            tools={tools}
            score={score}
             />
        <div className="absolute right-0 top-0 h-full w-[180px] bg-black bg-[length:200px_100px] bg-repeat" 
        style={{
                backgroundImage: 'url(/earth-soil-ground-texture-seamless-free.jpg)'}}></div>
        <div className={`absolute left-0 top-0 h-full bg-white shadow-lg p-4 ${sidebarOpen ? 'w-64 z-10' : 'w-0'} transition-width duration-300`}>
        {sidebarOpen && (
          <div className='flex flex-col space-y-4'>
            <h2 className="text-xl font-bold ml-4 mb-4">Settings</h2>
            <button onClick={togglePause} className="w-full bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded mb-2">
              {gamePaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={playBackgroundMusic} className="w-full bg-green-500 hover:bg-green-700 text-black font-bold py-2 px-4 rounded mb-2">
              Play Background Music
            </button>
            <button onClick={stopBackgroundMusic} className="w-full bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mb-2">
              Stop Background Music
            </button>
            <button onClick={resetScoreAndTools} className="w-full bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded">
              Reset Score and Tools
            </button>
            <button onClick={async () => {
                if (!receiverAddress) {
                    alert('You need to connect your wallet to perform this action.')
                    return
                }
                if (score < 0) {
                    alert('You cannot withdraw less than 0')
                }
                setIsMining(true)
                await handleMint(receiverAddress, score.toString())
                setIsMining(false)
                resetScoreAndTools()
            }} className="w-full bg-green-500 hover:gb-green-700 text-white font-bold py-2 px-4 rounded">
              {isMining ? 'Withdrawing...' : 'Withdraw funds to wallet'}
            </button>
          </div>
        )}
      </div>
      <button onClick={toggleSidebar} className="w-28 absolute top-2 left-2 z-10 bg-gray-800 text-white px-4 py-2 rounded">
        {sidebarOpen ? 'Close' : 'Settings'}
      </button>
      <div className="relative w-full h-96 flex items-center justify-center">
        {sources.map((source, i) => (
          <div key={i}>
            <img
              key={source.id}
              src={source.image}
              alt={`Coin Source ${source.id}`}
              className="w-20 h-20 absolute right-[170px]"
              style={{ top: `calc(50% + ${source.offsetY - 300}px)` }}
            />
            <div
              className="absolute w-[60%] right-[130px] h-4 bg-cover rounded-lg"
              style={{
                backgroundImage: 'url(/earth-soil-ground-texture-seamless-free.jpg)',
                top: `calc(50% + ${source.offsetY - 230}px)`
              }}
            />
          </div>
        ))}
        <img id="miner" src="/pngtree_gold_6779698.png" alt="Miner" className="w-[150px] h-[130px] absolute top-4 right-[170px]" />
        <div
              className="absolute w-[60%] top-[140px] right-[130px] h-4 bg-cover rounded-lg"
              style={{
                backgroundImage: 'url(/earth-soil-ground-texture-seamless-free.jpg)',
              }}
         />
        {coins.map((coin) => (
          <img
            key={coin.id}
            src={coin.type.image}
            alt="Coin"
            className="coin w-12 h-12 absolute"
            style={{ left: `${coin.posX}px`, top: `${coin.posY}px` }}
          />
        ))}
      </div>
      <div className="absolute left-10 top-14 mt-auto flex flex-col items-start">
        <div className="grid grid-cols-1 gap-4">
          <div
            onClick={() => addSource(1)}
            className="cursor-pointer p-4 bg-white shadow-lg rounded-lg text-center"
          >
            <img src="/vecteezy_cartoon-miner-with-shovel-and-pickaxe-in-the-ground_44651914.png" alt="Free Miner" className="w-16 h-16 mx-auto mb-2" />
            <p>Single miner</p>
            <p>Mines 1 coin per Minute</p>
            <p>Cost: Free</p>
          </div>
          <div
            onClick={() => addSource(2)}
            className="cursor-pointer p-4 bg-white shadow-lg rounded-lg text-center"
          >
            <img src="/Lovepik_com-401088916-mining-workers.png" alt="Multiple Miners" className="w-16 h-16 mx-auto mb-2" />
            <p>Multiple Miners</p>
            <p>Mines 4 coins per Minute</p>
            <p>+ Gold gems rewards</p>
            <p>Cost: 20 Coins</p>
          </div>
          <div
            onClick={() => addSource(3)}
            className="cursor-pointer p-4 bg-white shadow-lg rounded-lg text-center"
          >
            <img src="/Lovepik_com-401723709-working-coal-miners.png" alt="Miner with Drill" className="w-16 h-16 mx-auto mb-2" />
            <p>Miner with Drill</p>
            <p>Mines 6 coins per Minute</p>
            <p>+ Gold gems rewards</p>
            <p>Cost: 30 Coins</p>
          </div>
          <div
            onClick={() => addSource(4)}
            className="cursor-pointer p-4 bg-white shadow-lg rounded-lg text-center"
          >
            <img src="/png-transparent-caterpillar-inc-caterpillar-797f-haul-truck-die-cast-toy-mining-truck-dump-truck-vehicle-thumbnail.png" alt="Drilling Vehicle" className="w-16 h-16 mx-auto mb-2" />
            <p>Drilling Vehicle</p>
            <p>Mines 8 coins per Minute</p>
            <p>+ Gold gems rewards</p>
            <p>Cost: 40 Coins: </p>
          </div>
        </div>
      </div>
      {/* Hidden audio elements for sound effects and background music */}
      <audio ref={coinSoundRef} src="/coin-flip-88793.mp3"></audio>
      <audio ref={backgroundMusicRef} src="/video-game-music-loop-27629.mp3" loop></audio>
    </div>
  );
};


const Header = ({ balance, onConnect, receiverAddress, score, tools }) => {
    return (
        <header className="w-screen z-10 bg-brown-500 text-white p-4 pl-20 flex justify-between items-start absolute top-0">
            <h1 className="text-xl font-bold ml-12">Divine Coin Miner</h1>
            <div>
            <p className="text-lg">
          Game DIV Balance: <span id="Game balance">{`${score} -> $ ${score * 61751.33} USD`}</span>
        </p>
        <p className="text-lg">
          Tools: <span id="tools">{tools} of 6</span>
        </p>
        </div>
            <div className="flex items-center space-x-4">
                <p>DIV Balance: <span className="font-bold">$ {balance}</span></p>
                <p>TOTAL USD Balance: <span className="font-bold">$ {balance * 61751.33}</span></p>
                <button
                    onClick={onConnect}
                    className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-200 transition duration-300"
                >
                    {receiverAddress ? 'Copy referral link' : 'Connect Metamask'}
                </button>
            </div>
        </header>
    );
};

export default Game;
