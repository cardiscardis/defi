import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSearchParams } from 'next/navigation'
import divineCoinJson from './divine.json'
import { useRouter } from "next/router";

const contractAddress = '0xb39a34929b45d70af809e423189b7fb8593794c2';
const contractABI = divineCoinJson.abi

export default function Home() {
    const searchParams = useSearchParams()
    const share = useRouter();

    const [signer, setSigner] = useState(null);
    const [divineCoin, setDivineCoin] = useState(null);
    const [balance, setBalance] = useState('0');
    const [isMining, setIsMining] = useState(false)
    const [isRegistering, setIsRegistering] = useState(false)
    const [IsRemovingUser, setIsRemovingUser] = useState(false)
    const [receiverAddress, setReceiverAddress] = useState()
    const [isLoadingPage, setIsLoadingPage] = useState(false)
    const [users, setUsers] = useState([]);
    const amountToSend = '1';

    const referralLinkAddress = searchParams.get('link')

    useEffect(() => {
        const initEthers = async () => {
            if (window.ethereum) {
                await addRSKTestnetNetwork()
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                setIsLoadingPage(true)
                const signer = provider.getSigner();
                const signerAddress = await signer.getAddress()
                // const divineCoin2 = new ethers.Contract(contractAddress, contractABI, signer);
                const provider2 = new ethers.providers.JsonRpcProvider('https://public-node.testnet.rsk.co');
                const signer2 = new ethers.Wallet('8295d8ae8aabfb6f2d8d971d0c0f99aba97aa2e490e4ccdfcdc0826aa82cf63b', provider2);
                const contract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer2
                );
                setDivineCoin(contract);
                setReceiverAddress(signerAddress)
                setSigner(signer2);
                const users = await fetchUsers(contract);
                if (!users.length) await handleAddUser(signerAddress, contract)
                updateBalance(signerAddress, contract);
                referralLinkAddress && referralLinkAddress !== signerAddress && handleMint(referralLinkAddress, '5')
                setIsLoadingPage(false)
            } else {
                alert('Please install MetaMask and refresh to use this dApp!');
            }
        };
        initEthers();
    }, []);

    const updateBalance = async (address, divineCoin) => {
        try {
            const balanceInWei = await divineCoin.balanceOf(address);
            const balance = ethers.utils.formatUnits(balanceInWei, 'ether');
            setBalance(balance);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async (coin) => {
        try {
            const users = await coin.getUsers();
            setUsers(users);
            return users
        } catch (error) {
            console.error(error);
        }
    };

    const handleMint = async (address, amount) => {
        try {
            if (isMining) return
            const amountInWei = ethers.utils.parseUnits(amount, 'ether');
            setIsMining(true)
            const tx = await divineCoin.mint(address, amountInWei);
            await tx.wait();
            updateBalance(receiverAddress, divineCoin);
            setIsMining(false)
        } catch (error) {
            console.error(error);
            setIsMining(false)
        }
    };

    const handleAddUser = async (address, contract) => {
        try {
            setIsRegistering(true)
            const coin = divineCoin ?? contract;
            const tx = await coin.addUser(address);
            await tx.wait();
            setIsRegistering(false)
            alert('User added successfully');
            // fetchUsers(divineCoin);
        } catch (error) {
            console.error(error);
            alert('Failed to add user ' + error.message);
            setIsRegistering(false)
        }
    };

    const handleRemoveUser = async (address) => {
        try {
            setIsRemovingUser(true)
            const tx = await divineCoin.removeUser(address);
            await tx.wait();
            setIsRemovingUser(false)
            alert('User removed successfully');
            // fetchUsers(divineCoin);
        } catch (error) {
            console.error(error);
            alert('Failed to remove user ' + error.message);
            setIsRemovingUser(false)
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
        const url = `divine-coin-miner.vercel.app/mine?link=${receiverAddress}`;
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

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12"
            style={{ backgroundImage: 'url("./440955465_2688548457981197_3063607287106051012_n.jpg")' }}
        >
            <Header balance={balance} onConnect={receiverAddress ? copylink : connectWallet} receiverAddress={receiverAddress} />
            {isLoadingPage ? <TailwindLoader text={'Loading... Please wait...'} /> :
                isRegistering ? <TailwindLoader text={'Registering user... Please wait...'} /> : <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full z-10">
                    <h1 className="text-2xl font-bold mb-6 text-center text-black">Divine Coin Management</h1>
                <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2 text-black">Mine Divine Coins</h2>
                    <button
                            onClick={() => receiverAddress ? handleMint(receiverAddress, amountToSend) : connectWallet()}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                    >
                            {!receiverAddress ? 'Connect Wallet' : isMining ? <TailwindLoader text={'Mining...'} /> : 'Mine (10 DIV)'}
                    </button>
                </div>
                    {/* <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
                    <input
                        type="text"
                        placeholder="User address"
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 mb-2 w-full"
                    />
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleAddUser(userAddress)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full"
                        >
                            {isRegistering ? <TailwindLoader text={'Adding User...'} /> : 'Add User'}
                        </button>
                        <button
                            onClick={() => handleRemoveUser(userAddress)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 w-full"
                        >
                            {IsRemovingUser ? <TailwindLoader text={'Removing User...'} /> : 'Remove User'}
                        </button>
                    </div>
                </div> */}
                <p className="text-lg">
                        Balance: <span className="font-bold text-black">{balance}</span> DIV
                </p>
                </div>
            }
            <div className='w-full h-full absolute bg-opacity-70 bg-black'></div>
        </div>
    );
}

function TailwindLoader({ text }) {
    return (
        <div className='z-20'>
            <div
                className="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status">
                <span
                    className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)] !text-white"
                >Loading...</span>
            </div>
            <span className='ml-4 text-white'>{text}</span>
        </div>
    );
}

const Header = ({ balance, onConnect, receiverAddress }) => {
    return (
        <header className="w-screen z-10 bg-brown-500 text-white p-4 flex justify-between items-center absolute top-0">
            <h1 className="text-xl font-bold">Divine Coin Miner</h1>
            <div className="flex items-center space-x-4">
                <p>Balance: <span className="font-bold">$ {balance * 61751.33}</span> USD</p>
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