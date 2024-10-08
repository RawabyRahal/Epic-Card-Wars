import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components";
import { battlegrounds } from "../assets";
import { useGlobalContext } from "../context";
import styles from "../styles";

const Battleground = () => {
  const navigate = useNavigate();
  const { showAlert, setShowAlert, setBattleGround } = useGlobalContext();

  const handleBattleChoice = (ground) => {
    setBattleGround(ground.id);
    console.log(ground.id);
    // Save the selected battleground to localStorage
    localStorage.setItem('battleground', ground.id);
    setShowAlert({ status: true, type: 'info', message: `${ground.name} is battle ready!` });

    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  useEffect(() => {
    // Retrieve the saved battleground from localStorage on component mount
    const savedBattleGround = localStorage.getItem('battleground');
    if (savedBattleGround) {
      console.log(`Retrieved battleground from localStorage: ${savedBattleGround}`);
      setBattleGround(savedBattleGround);
    } else {
      console.log('No battleground found in localStorage');
    }
  }, [setBattleGround]);

  return (
    <div className={`${styles.flexCenter} ${styles.battlegroundContainer}`}>
      {showAlert?.status && (
        <Alert type={showAlert.type} message={showAlert.message} />
      )}

      <h1 className={`${styles.headText} text-center`}>
        Choose your
        <span className="text-siteViolet"> Battle </span>
        Ground
      </h1>

      <div className={`${styles.flexCenter} ${styles.battleGroundsWrapper} max-h-[500px] overflow-y-auto p-8`}>
        {battlegrounds.map((ground) => (
          <div
            key={ground.id}
            className={`${styles.flexCenter} ${styles.battleGroundCard}`}
            onClick={() => handleBattleChoice(ground)}
          >
            <img
              src={ground.image}
              alt="saiman"
              className={styles.battleGroundCardImg}
            />

            <div className="info absolute">
              <p className={styles.battleGroundCardText}>{ground.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Battleground;
