import React, { useState, useEffect } from "react";
import { PageHOC, CustomInput, CustomButton } from "../components";
import { useGlobalContext } from "../context";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();
  const { contract, walletAddress, setShowAlert, gameData, setErrorMessage } = useGlobalContext();
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    console.log({ contract, walletAddress });
  }, [contract, walletAddress]);

  const handleClick = async () => {
    try {
      if (!contract || !walletAddress) {
        console.error("Contract or wallet address is not defined");
        return;
      }

      const playerExists = await contract.isPlayer(walletAddress);
      console.log("playerExists:", playerExists);

      if (playerExists) {
        setShowAlert({
          status: true,
          type: "failure",
          message: `You're already registered`,
        });
        return;
      }

      await contract.registerPlayer(playerName, playerName, { gasLimit: 200000 });
      setShowAlert({
        status: true,
        type: "info",
        message: `Registering ${playerName}...`,
      });
    } catch (error) {
      setErrorMessage(error);
    }
  };

  useEffect(() => {
    const checkForPlayerToken = async () => {
      const playerExists = await contract.isPlayer(walletAddress);
      const playerTokenExists = await contract.isPlayerToken(walletAddress);
      console.log({ playerExists, playerTokenExists });
      if (playerExists && playerTokenExists) {
        navigate("/create-battle");
      }
    };
    if (contract) checkForPlayerToken();
  }, [contract]);

  useEffect(() => {
    if (gameData.activeBattle) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    }
  }, [gameData]);

  return (
    walletAddress && (
      <div className="flex flex-col">
        <CustomInput
          label="Name"
          placeHolder="Enter your player name"
          value={playerName}
          handleValueChange={setPlayerName}
        />

        <CustomButton
          title="Register"
          handleClick={handleClick}
          restStyles="mt-6"
        />
      </div>
    )
  );
};

export default PageHOC(
  Home,
  <>
    Welcome to Avalanche Legends <br /> a Web3 NFT Card Game
  </>,
  <>
    Connect your wallet to start playing <br /> the ultimate Web3 Battle Card
    Game
  </>
);
