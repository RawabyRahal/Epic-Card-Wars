import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useNavigate } from 'react-router-dom';

// import { GetParams } from '../utils/onboard.js';
import { ABI, ADDRESS } from '../contract';
// import { createEventListeners } from './createEventListeners';

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState('');
  const [contract, setContract] = useState('');
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "info",
    message: "",
  });

  // set the wallet address to the state
  const updateCurrentWalletAddress = async () => {
    const accounts = await window.ethereum.request({method: "eth_requestAccounts" });
    console.log(accounts);
    if (accounts) {setWalletAddress(accounts[0]);
   }
  };
  useEffect(() => {
    updateCurrentWalletAddress();
    // window.ethereum.on("accountsChanged", updateCurrentWalletAddress);
  }, []);
  console.log({walletAddress})

  // set smart contract and provider to the state
  useEffect(() => {
    const setSmartContractAndProvider = async () => {
      const web3Modal = new Web3Modal();
      console.log({web3Modal})
      const connection = await web3Modal.connect();
      console.log({connection})
      const newProvider = new ethers.providers.Web3Provider(connection);
      console.log({newProvider})
      const signer = newProvider.getSigner();
      console.log({ADDRESS, ABI, signer})
      const newContract = new ethers.Contract(ADDRESS, ABI, signer);

      setProvider(newProvider);
      setContract(newContract);
    };

    setSmartContractAndProvider();
  }, []);


  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: "info", message: "" });
      }, [5000]);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <GlobalContext.Provider
      value={{ contract, walletAddress, showAlert, setShowAlert }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
