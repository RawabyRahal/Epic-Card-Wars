// context.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { ABI, ADDRESS } from "../contract";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "info",
    message: "",
  });

  console.log({ contract, walletAddress });

  useEffect(() => {
    const loadProvider = async () => {
      if (window.ethereum) {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(_provider);
        const accounts = await _provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
      } else {
        console.error("Please install MetaMask!");
      }
    };
    loadProvider();
  }, []);

  useEffect(() => {
    if (provider && walletAddress) {
      const loadContract = async () => {
        try {
          const signer = provider.getSigner();
          const _contract = new ethers.Contract(ADDRESS, ABI, signer);
          setContract(_contract);
        } catch (error) {
          console.error("Error loading contract:", error);
        }
      };
      loadContract();
    }
  }, [provider, walletAddress]);

  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: 'info', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <GlobalContext.Provider
      value={{ walletAddress, contract, showAlert, setShowAlert }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
