"use client";

import { ethers } from "ethers";
import { useEffect, useState } from "react";

export default function Form() {
  const [privateKey, setPrivateKey] = useState<string>("");
  const [balance, setBalance] = useState<null | number>(null);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [tokenList, setTokenList] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const wallet = new ethers.Wallet(privateKey);

      // Check if MetaMask is available
      if (window.ethereum && window.ethereum.isMetaMask) {
        // Request access to the user's MetaMask accounts
        await window.ethereum.enable();
        // Create an ethers.js provider using MetaMask
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Get the balance of the wallet
        const balance = await provider.getBalance(wallet.address);
        setBalance(ethers.utils.formatEther(balance));
      } else {
        console.error("MetaMask not found");
      }
    } catch (error) {
      console.log(error);
      console.error("Invalid private key");
    }
  };

  const handleAddToken = async (event) => {
    event.preventDefault();

    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const tokenContract = new ethers.Contract(
          tokenAddress,
          [
            "function symbol() view returns (string)",
            "function balanceOf(address) view returns (uint256)",
          ],
          signer
        );

        // Retrieve the token symbol
        const symbol = await tokenContract.symbol();

        // Retrieve the token balance
        const balance = await tokenContract.balanceOf(signer.getAddress());

        setTokenList((prevTokenList) => [
          ...prevTokenList,
          { address: tokenAddress, symbol, balance },
        ]);
        setTokenAddress("");
      } else {
        console.error("Metamask not found.");
      }
    } catch (error) {
      console.error("Error adding token:", error);
    }
  };

  const handleTokenAddressChange = (event) => {
    setTokenAddress(event.target.value);
  };

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(event.target.value);
  };

  useEffect(() => {
    const getWalletBalance = async () => {
      try {
        if (window.ethereum && window.ethereum.isMetaMask) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();

          const signer = provider.getSigner();
          const address = await signer.getAddress();

        //   if (accounts.length > 0) {
        //     const address = accounts[0];
            const balance = await provider.getBalance(address);
            // console.log(+balance)
            setBalance(+balance);
        //   }
        }
      } catch (error) {
        
        console.error("Error fetching wallet balance:", error);
      }
    };

    getWalletBalance();
  }, []);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        if (window.ethereum && window.ethereum.isMetaMask) {
            const kek = new ethers.providers.Web3Provider(window.ethereum);
            const provider = new ethers.providers.EtherscanProvider();
            const signer = kek.getSigner();
            const address = await signer.getAddress();
            const history = await provider.getHistory(address);
            console.log("🚀 ~ file: Form.tsx:117 ~ fetchTransactionHistory ~ history:", history)

          setTransactionHistory(history);
        }
      } catch (error) {
        console.log(error)
        console.error("Error fetching transaction history:", error);
      }
    };

    fetchTransactionHistory();
  }, []);

  return (
    <div>
      <h2>Provide Private Key</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Private Key:
          <input type="text" value={privateKey} onChange={handleInputChange} />
        </label>
        <button type="submit">Submit</button>
        <p>ETH balance: {balance}</p>
      </form>

      <h2>Add Custom Token</h2>
      <form onSubmit={handleAddToken}>
        <label>
          Token Address:
          <input
            type="text"
            value={tokenAddress}
            onChange={handleTokenAddressChange}
          />
        </label>
        <button type="submit">Add Token</button>
      </form>

      <h2>Token List</h2>
      {tokenList.length > 0 ? (
        <ul>
          {tokenList.map((token, index) => (
            <li key={index}>
              Address: {token.address}, Symbol: {token.symbol}, Balance:{" "}
              {token.balance.toString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No tokens added yet.</p>
      )}

      <h2>Transaction History</h2>
      {transactionHistory.length > 0 ? (
        <ul>
          {transactionHistory.map((transaction, index) => (
            <li key={index}>
              Hash: {transaction.hash}, Value: {transaction.value.toString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No transaction history.</p>
      )}
    </div>
  );
}
