import { Snackbar, Alert } from "@mui/material";
import React, { useContext } from 'react'
import { Context } from '../context/UserContext';
import studyImg from "../assets/images/study.svg";
import logoImg from "../assets/images/login-logo.png";
import { Loginform } from "../components";

export default function Login() {


  const { open, openError } = useContext(Context)


  return (

    <div
      className="fixed inset-0 flex overflow-hidden"
      style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* ══ LEFT — Ko'k panel (770px dan katta bo'lsa ko'rinadi) ══ */}
      <div
        className="hidden min-[770px]:block flex-shrink-0 bg-[#1C2B57] h-full"
        style={{
          width: "50%",
          backgroundImage: `url(${studyImg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "75%",
        }} />

      {/* ══ RIGHT — Oq forma paneli ══ */}
      <div
        className="
          flex-1 min-[770px]:flex-shrink-0
          bg-white flex flex-col items-center justify-between
          overflow-hidden h-full
        "
        style={{
          /* 770px dan kichikda full width, kattalarda 50% */
          width: "100%",
          padding: "clamp(24px, 5vh, 40px) clamp(20px, 6vw, 60px)",
        }}
      >
        {/* Markaziy kontent */}
        <div
          className="flex-1 flex flex-col items-center justify-center w-full"
          style={{ maxWidth: 380 }}
        >
          {/* Logo */}
          <img
            src={logoImg}
            alt="MaxEdu Logo"
            style={{
              width: "min(500px, 90%)",
              height: "auto",
              objectFit: "contain",
              marginBottom: 40,
            }}
          />

          {/* Forma */}
          <Loginform />
        </div>

        {/* Footer */}
        <div style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', paddingBottom: '10px', marginTop: 'auto', fontWeight: 500 }}>
          Copyright © 2026 MaxEdu CRM
        </div>
      </div>

      {/* MUI — faqat notification uchun */}
      <Snackbar open={open} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Muvaffaqiyatli kirildi! Dashboard ga o'tilmoqda...
        </Alert>
      </Snackbar>

      <Snackbar open={openError} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity='error' variant="filled" sx={{ width: "100%" }}>
          "Telefon raqam yoki parol xato!"
        </Alert>
      </Snackbar>
    </div>
  );
}
