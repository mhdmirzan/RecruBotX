import React from "react";
import logo from "../assets/images/general/logo.png";
import letterLogo from "../assets/images/general/letter-logo.png";

const Logo = ({ className = "h-8 w-auto", title = "Interveuu", variant = "full" }) => {
  const src = variant === "letter" ? letterLogo : logo;
  return <img src={src} className={className} alt={title} />;
};

export default Logo;
