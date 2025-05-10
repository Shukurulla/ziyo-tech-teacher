import React from "react";
import { practicTests } from "../constants";

const PracticTests = () => {
  return (
    <div>
      <div className="row">
        {practicTests.map((item) => (
          <div className="col-lg-6 col-md-6 col-m">
            <div
              className={`mb-4 p-3 cursor-pointer select-none ${
                item.state == "done"
                  ? "bg-[#2AD92A66] text-[#135213]"
                  : "bg-white"
              } rounded-lg `}
            >
              <h1 className=" text-3xl font-[500] mb-3">{item.title}</h1>
              <p className="text-lg">{item.description}</p>
              <p className="text-end font-[600] text-xl">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticTests;
