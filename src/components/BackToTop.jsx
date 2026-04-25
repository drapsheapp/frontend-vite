import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="
      fixed right-6 bottom-40
      sm:bottom-40 
      md:bottom-36
      w-12 h-12
      rounded-full
      bg-white
      text-gray-700
      shadow-xl
      border
      hover:shadow-2xl
      hover:scale-105
      transition
      flex items-center justify-center
      z-40
      "
    >
      <ChevronUp size={22} />
    </button>
  );
};

export default BackToTop;