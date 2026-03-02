import React from "react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white text-center py-3 mt-5">
      <p className="mb-0">
        © {new Date().getFullYear()} Insurance Policy Management System. All Rights Reserved.
      </p>
    </footer>
  );
}
