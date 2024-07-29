import React, { createContext, useContext, useEffect, useState } from "react";
import { useRef } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { ABI, ADDRESS } from "../contract";
import createEventListeners from "./createEventListeners";
import { useNavigate } from "react-router-dom";
import { GetParams } from "../utils/onboard.js";
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
  // const [battleGround, setBattleGround] = useState();
  const [battleGround, setBattleGround] = useState(
    localStorage.getItem("battleground") || "bg-astral"
  );
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "info",
    message: "",
  });

  const player1Ref = useRef();
  const player2Ref = useRef();

  console.log({ contract, walletAddress });

  const updateCurrentWalletAddress = async () => {
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

  useEffect(() => {
    updateCurrentWalletAddress();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    };
    window.ethereum?.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
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
      console.log({ pendingBattles });
    };

    if (contract) fetchGameData();
  }, [contract, updateGameData]);

  // set the battle ground to local storage
  useEffect(() => {
    if (battleGround) {
      localStorage.setItem("battleground", battleGround);
    }
  }, [battleGround]);

  //* Reset web3 onboarding modal params
  useEffect(() => {
    const resetParams = async () => {
      const currentStep = await GetParams();
      setStep(currentStep.step);
    };
    resetParams();
    window?.ethereum?.on("chainChanged", () => resetParams());
    window?.ethereum?.on("accountsChanged", () => resetParams());
  }, []);

  useEffect(() => {
    if (step !== -1 && contract) {
      createEventListeners({
        navigate,
        contract,
        provider,
        walletAddress,
        setShowAlert,
        setUpdateGameData,
        updateCurrentWalletAddress,
        player1Ref,
        player2Ref,
      });
    }
  }, [contract, step]);

  //* Handle error messages
  useEffect(() => {
    if (errorMessage) {
      const parsedErrorMessage = errorMessage?.reason
        ?.slice("execution reverted: ".length)
        .slice(0, -1);

      if (parsedErrorMessage) {
        setShowAlert({
          status: true,
          type: "failure",
          message: parsedErrorMessage,
        });
      }
    }
  }, [errorMessage]);

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
        battleGround,
        setBattleGround,
        errorMessage,
        setErrorMessage,
        updateCurrentWalletAddress,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
