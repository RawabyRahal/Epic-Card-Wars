// context.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { ABI, ADDRESS } from "../contract";
import createEventListeners from "./createEventListeners";
import { useNavigate } from "react-router-dom";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [gameData, setGameData] = useState({
    players: [],
    pendingBattles: [],
    activeBattle: null,
  });
  const [battleName, setBattleName] = useState(null);
  const [updateGameData, setUpdateGameData] = useState(0);
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
        console.error(
          "Please install a web3 wallet like MetaMask, Core Wallet, or any other supported wallet!"
        );
      }
    };
    loadProvider();
  }, []);

  // set smart contract, ptovider to the state
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
    if (contract) {
      createEventListeners({
        navigate,
        contract,
        provider,
        walletAddress,
        setShowAlert,
        setUpdateGameData,
      });
    }
  }, [contract, updateGameData]);

  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: "info", message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  // set the game data to the state
  useEffect(() => {
    const fetchGameData = async () => {
      let activeBattle = null;

      const fetchedBattles = await contract.getAllBattles();
      // to show the pending games
      const pendingBattles = fetchedBattles.filter(
        (battle) => battle.battleStatus === 0
      );

      fetchedBattles.forEach((battle) => {
        if (
          battle.players.find(
            (player) => player.toLowerCase() === walletAddress.toLowerCase()
          )
        ) {
          if (battle.winner.startsWith("0x00")) {
            activeBattle = battle;
          }
        }
      });
      setGameData({ pendingBattles: pendingBattles.slice(1), activeBattle });
      console.log({ fetchedBattles });
    };

    if (contract) fetchGameData();
  }, [contract]);

  return (
    <GlobalContext.Provider
      value={{
        walletAddress,
        contract,
        showAlert,
        setShowAlert,
        battleName,
        setBattleName,
        gameData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
