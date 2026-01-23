import React, { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "./Rocket loader.json";

const RocketLoad = ({ width = 150, height = 150, loop = true, speed = 4 }) => {
  const lottieRef = useRef();

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  return (
    <div className="flex justify-center items-center w-full h-full p-4">
      <Lottie
        lottieRef={lottieRef}
        animationData={loadingAnimation}
        loop={loop}
        style={{ width, height }}
      />
    </div>
  );
};

export default RocketLoad;
