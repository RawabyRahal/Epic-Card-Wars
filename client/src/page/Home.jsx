import React from "react";
import { PageHOC } from "../components";

const Home = () => {
  return <div>Home</div>;
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
