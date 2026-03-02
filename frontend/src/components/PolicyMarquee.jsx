import React from "react";
import "./marquee.css";

export default function PolicyMarquee() {
  const news = [
    "🔔 New Health Insurance plans launched with zero waiting period",
    "🔥 Limited-time discount on Life Insurance policies",
    "🆕 Vehicle Insurance now covers EV batteries",
    "📢 Claim settlement ratio increased to 99.2%",
    "⏳ Last date to renew policies with no penalty: March 31",
    "🎉 Special benefits for senior citizens"
  ];

  return (
    <div className="news-marquee">
      <div className="news-track">
        {[...news, ...news].map((item, index) => (
          <span className="news-item" key={index}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}