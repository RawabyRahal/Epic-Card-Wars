import React, { useState } from "react";
import { PageHOC, CustomInput, CustomButton } from "../components";
import { useGlobalContext } from "../context";

const Home = () => {
  const { contract, walletAddress, setShowAlert } = useGlobalContext();
  const [playerName, setPlayerName] = useState("");

  const handleClick = async () => {
    try {
      console.log({ contract , walletAddress });
      const playerExists = await contract.isPlayer(walletAddress);

      console.log({ playerExists });
      if (!playerExists) {
        await contract.registerPlayer(playerName, playerName);
      }

      setShowAlert({
        status: true,
        type: "info",
        message: `Registering ${playerName}...`,
      });

    } catch (error) {
      setShowAlert({
        status: true,
        type: "failure",
        message: `${error.message}`,
      });
      console.error({ error: error });
      // alert(error);
    }
  };

  return (
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
