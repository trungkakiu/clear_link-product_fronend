import React, { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion"; // Vít ga thêm thư viện này
import loadingAnimation from "./Rocket loader.json";

const RocketLoad = ({
  width = 150,
  height = 150,
  loop = true,
  speed = 4,
  isVisible = true, // Thêm prop này để kiểm soát hiệu ứng Out
}) => {
  const lottieRef = useRef();

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="d-flex justify-content-center align-items-center w-100 p-4"
          style={{ minHeight: "200px" }}
        >
          <div className="text-center">
            <Lottie
              lottieRef={lottieRef}
              animationData={loadingAnimation}
              loop={loop}
              style={{ width, height }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.3 }}
              className="text-aws-navy font-mono small mt-2 fw-bold"
            >
              INITIALIZING DATA NODE...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RocketLoad;
