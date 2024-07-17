import React, { useState, useEffect } from 'react';

const GameBoard = () => {
  const [coinPositions, setCoinPositions] = useState([0, 25]);
const [currentTime, setCurrentTime] = useState(0);
const [score, setScore] = useState(0);
const [previousTime, setPreviousTime] = useState(0); // Define previousTime state


  const pathLength = 100; // Assuming path length is 100 (adjust as needed)

  const calculateNewPosition = (currentTime, previousTime, position = 0) => {
    const elapsedTime = currentTime - previousTime;
    const speed = 100; // Adjust speed as needed

    let newPosition;
    if (position < pathLength / 2) {
      newPosition = position + speed * elapsedTime;
    } else {
      newPosition = pathLength - (position - pathLength / 2) - speed * elapsedTime;
    }

    // Ensure newPosition stays within path bounds
    return Math.max(0, Math.min(newPosition, pathLength));
  };

  useEffect(() => {
    if (currentTime > 0) {
      const updatedPositions = coinPositions.map((position, index) => {
        return calculateNewPosition(currentTime, previousTime, position);
      });
      setCoinPositions(updatedPositions);

      // Check for coin reaching destination (adjust logic as needed)
      updatedPositions.forEach(position => {
        if (position >= pathLength - 10) {
          setScore(score + 1);
        }
      });
    }
    // Update previousTime for next calculation
    setPreviousTime(currentTime);
  }, [currentTime, coinPositions]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now()); // Update current time
    }, 10); // Adjust interval time (in milliseconds) for desired movement speed

    return () => clearInterval(intervalId); // Cleanup function to clear interval on unmount
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-80">
        <UPath rotation={0} />
        {coinPositions.map((position, index) => (
          <Coin key={index} position={position} />
        ))}
      </div>
      <p className="text-xl font-bold">Score: {score}</p>
    </div>
  );
};


const Coin = ({ position }) => {
  const coinStyles = {
    transform: `translate(${position * 20}px, 0px)`,
  };

  return (
    <div className="w-4 h-4 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={coinStyles}>
    </div>
  );
};

const UPath = () => {
  return (
    <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 100">
      <path
        d="M 0 0 L 100 0 L 100 80 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
    </svg>
  );
};


export default GameBoard;
