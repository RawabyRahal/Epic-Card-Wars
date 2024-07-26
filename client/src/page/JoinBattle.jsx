import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context";
import styles from "../styles";
import { PageHOC, CustomButton } from "../components";

const JoinBattle = () => {
  const navigate = useNavigate();
  const {
    contract,
    gameData,
    setShowAlert,
    setBattleName,
    walletAddress,
    setErrorMessage,
  } = useGlobalContext();

  const handleClick = async (battleName) => {
    setBattleName(battleName);
    console.log({ battleName, contract });

    // Log gameData and walletAddress to verify their values
    console.log("gameData:", gameData);
    console.log("walletAddress:", walletAddress);

    try {
      // Check if the player is already in a battle
      const playerBattles = gameData.pendingBattles.filter((battle) =>
        battle.players.includes(walletAddress)
      );

      console.log("playerBattles:", playerBattles);

      if (playerBattles.length > 0) {
        setShowAlert({
          status: true,
          type: "failure",
          message: "You are already in a battle",
        });
        return;
      }

      await contract.joinBattle(battleName);
      setShowAlert({
        status: true,
        type: "success",
        message: `Joining ${battleName}`,
      });

      // navigate(`/battle/${battleName}`);
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (
    <>
      <h2 className={styles.joinHeadText}>Available Battles:</h2>

      <div className={styles.joinContainer}>
        {gameData?.pendingBattles.length ? (
          gameData.pendingBattles
            .filter((battle) => !battle.players.includes(walletAddress))
            .map((battle, index) => (
              <div key={battle.name + index} className={styles.flexBetween}>
                <p className={styles.joinBattleTitle}>
                  {index + 1}. {battle.name}
                </p>
                <CustomButton
                  title="Join"
                  handleClick={() => handleClick(battle.name)}
                />
              </div>
            ))
        ) : (
          <p className={styles.joinLoading}>
            Reload the page to see new battles
          </p>
        )}
      </div>

      <p className={styles.infoText} onClick={() => navigate("/create-battle")}>
        Or create a new battle
      </p>
    </>
  );
};

export default PageHOC(
  JoinBattle,
  <>
    Join <br /> a Battle
  </>,
  <>Join already existing battles</>
);
