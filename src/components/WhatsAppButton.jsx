import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  return (
    <div className="fixed right-6 bottom-24 sm:bottom-12 md:bottom-16 z-50 flex flex-col items-end">

      <a
        href="https://wa.me/919205445152?text=Hi%20I%20am%20interested%20in%20Drapshe%20custom%20clothing"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl hover:scale-110 transition-transform duration-300"
      >
        <FaWhatsapp size={28} />
      </a>

    </div>
  );
};

export default WhatsAppButton;