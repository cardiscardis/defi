import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import divineCoinJson from './divine.json'

const contractAddress = '0x6761e76fab5ddc34fedb858be83da658c49c3889';
const contractABI = divineCoinJson.abi

export default function Home() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [divineCoin, setDivineCoin] = useState(null);
    const [balance, setBalance] = useState('0');
    const [userAddress, setUserAddress] = useState('');
    const [isMining, setIsMining] = useState(false)
    const [isRegistering, setIsRegistering] = useState(false)
    const [IsRemovingUser, setIsRemovingUser] = useState(false)
    const receiverAddress = '0x5CFb4D18bAfDb4A7E9663cf8CE87dB149D5611B3';
    const amountToSend = '10'; // 10 DIV

    useEffect(() => {
        const initEthers = async () => {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const divineCoin = new ethers.Contract(contractAddress, contractABI, signer);
                setProvider(provider);
                setSigner(signer);
                setDivineCoin(divineCoin);
                updateBalance(signer, divineCoin);
            } else {
                alert('Please install MetaMask to use this dApp!');
            }
        };
        initEthers();
    }, []);

    const updateBalance = async (signer, divineCoin) => {
        try {
            const address = await signer.getAddress();
            const balanceInWei = await divineCoin.balanceOf(address);
            const balance = ethers.utils.formatUnits(balanceInWei, 'ether');
            setBalance(balance);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMint = async () => {
        try {
            const amountInWei = ethers.utils.parseUnits(amountToSend, 'ether');
            setIsMining(true)
            const tx = await divineCoin.mint(receiverAddress, amountInWei);
            await tx.wait();
            setIsMining(false)
            updateBalance(signer, divineCoin);
        } catch (error) {
            console.error(error);
            setIsMining(false)
        }
    };

    const handleAddUser = async () => {
        try {
            setIsRegistering(true)
            const tx = await divineCoin.addUser(userAddress);
            await tx.wait();
            setIsRegistering(false)
            alert('User added successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to add user');
            setIsRegistering(false)
        }
    };

    const handleRemoveUser = async () => {
        try {
            setIsRemovingUser(true)
            const tx = await divineCoin.removeUser(userAddress);
            await tx.wait();
            setIsRemovingUser(false)
            alert('User removed successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to remove user');
            setIsRemovingUser(false)
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">Divine Coin Management</h1>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Mine Divine Coins</h2>
                    <button
                        onClick={handleMint}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                    >
                        {isMining ? <TailwindLoader text={'Mining...'} /> : 'Mine (10 DIV)'}
                    </button>
                </div>
                <div className="mb-6">
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
                            onClick={handleAddUser}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full"
                        >
                            {isRegistering ? <TailwindLoader text={'Adding User...'} /> : 'Add User'}
                        </button>
                        <button
                            onClick={handleRemoveUser}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 w-full"
                        >
                            {IsRemovingUser ? <TailwindLoader text={'Removing User...'} /> : 'Remove User'}
                        </button>
                    </div>
                </div>
                <p className="text-lg">
                    Balance: <span className="font-bold">{balance}</span> DIV
                </p>
            </div>
        </div>
    );
}

function TailwindLoader({ text }) {
    return (
        <div>
            <div
                className="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status">
                <span
                    className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                >Loading...</span>
            </div>
            <span className='ml-4'>{text}</span>
        </div>
    );
}