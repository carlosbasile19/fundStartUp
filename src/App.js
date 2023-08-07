import './App.css';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import contractABI from './StartUpFundingABI.json';

const contractAddress = '0xa564F430B47412d530e488cae169C66799ad7b5F'; 
let provider = new ethers.providers.Web3Provider(window.ethereum);
let contract = new ethers.Contract(contractAddress, contractABI, provider);
let signer;

function App() {
  const [totalFunds, setTotalFunds] = useState(0);
  const [owner, setOwner] = useState('');
  const [totalDonated, setTotalDonated] = useState(0);
  const [connectionSatus,setConnection] = useState('Not Connected');

  const connect = async () => {
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    const userAddress = await signer.getAddress();
    const networkData = await provider.getNetwork();
    let networkName = 'unknown';
    if (networkData.chainId === 1) networkName = 'mainnet';
    if (networkData.chainId === 5) networkName = 'goerli';
    if (networkData.chainId === 11155111) networkName = 'sepolia';

    console.log(userAddress);
    setConnection(`Connected to ${networkName} ${userAddress}`);
    updateBalances();
  }

  const deposit = async () => {
    try {
      let userAmount = document.getElementById('deposit-amount').value;
      const weiAmount = ethers.utils.parseEther(userAmount);
      const tx = await contract.fund({ value: weiAmount });
      await tx.wait();
      updateBalances();
    } catch (error) {
      console.error('Error during deposit:', error);
    }
  }
  

  const withdraw = async () => {
    await contract.withdrawFunds();
    updateBalances();
  }

  const updateBalances = async () => {
    const totalFunds = await contract.totalFunds();
    setTotalFunds(ethers.utils.formatEther(totalFunds));
    const totalDonated = await contract.totalDonated();
    setTotalDonated(ethers.utils.formatEther(totalDonated));

  }

  setTimeout(updateBalances, 100);
  

  return (
    <div className="App">
      <header className="App-header">
        <h1><span className="blue">Fund</span>StartUp</h1>
        <p>
          A perpetual vault for new startups.
        </p>

        <div className="App-body">
          <div className="App-balances">
            Donated: {totalFunds} ETH<br />
            Balance: {totalDonated} ETH<br />
          </div>
          <div className="App-button-box">
            <div className="App-connection">
              {connectionSatus}
            </div>
            <button onClick={connect}>CONNECT</button>
          </div>
          <div className="App-button-box">
            <input type="text" id="deposit-amount" placeholder="ETH" /><br />
            <button onClick={deposit}>DEPOSIT</button>
          </div>
          <div className="App-button-box">
            <button onClick={withdraw}>WITHDRAW</button>
          </div>
          <div className="App-contract">
            Contract <a href="https://sepolia.etherscan.io/address/0xa564f430b47412d530e488cae169c66799ad7b5f" target="_blank" el="noreferrer">0xa564f430b47412d530e488cae169c66799ad7b5f</a>
          </div>
      </div>
      </header>
    </div>
  );
}

export default App;
