import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import { AiChatLogo } from "../assets";

const AiChat = () => {
  const [messages, setMessages] = useState([]);

  //AIzaSyCDHrcJj3a3psrIdPMHkKR7-Z02ofBK9mo - gemini token
  return (
    <div className="relative w-[80%] mx-auto h-100">
      {messages.length == 0 ? (
        <div className="w-100 h-[90%] flex items-center justify-center">
          <img src={AiChatLogo} alt="" />
        </div>
      ) : (
        <div></div>
      )}

      <div className="input-box flex w-100 rounded-lg overflow-hidden bg-white absolute left-0 bottom-0">
        <input
          className="w-[95%] p-3 px-4 outline-none "
          type="text"
          placeholder="Yozing..."
        />
        <button className="w-[5%] flex items-center justify-center">
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default AiChat;
