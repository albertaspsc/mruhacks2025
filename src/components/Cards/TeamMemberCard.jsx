"use client";

import React from "react";
import cardBackground from "../../assets/backgrounds/card-bg.png";

const TeamMemberCard = ({ member }) => {
  return (
    <div className="w-[120px] mx-auto">
      <div
        className="w-full h-[280px] rounded-lg overflow-hidden bg-white bg-opacity-90"
        style={{
          // backgroundImage: `url('${cardBackground.src}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="p-1 flex justify-center">
          <div className="relative w-[400px] h-[400px] overflow-hidden rounded">
            <img
              src={`/team/${member.pic.split("/").pop()}`}
              alt={member.name}
              style={{
                width: "200px",
                height: "270px",
                objectFit: "cover",
                maxWidth: "200px",
                maxHeight: "270px",
              }}
              onError={(e) => {
                e.target.src = "../../assets/mascots/crt2.png"; // TODO FIX
              }}
            />

            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-70 p-1">
              <p
                className="font-bold text-xs text-white text-center truncate"
                style={{ fontFamily: "'DM Sans Mono', monospace" }}
              >
                {member.name}
              </p>
              <p
                className="text-[10px] text-white text-center truncate"
                style={{ fontFamily: "'DM Sans Mono', monospace" }}
              >
                {member.title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
