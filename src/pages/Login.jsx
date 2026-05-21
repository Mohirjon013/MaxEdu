import { Snackbar, Alert } from "@mui/material";
import React, { useContext } from 'react'
import { Context } from '../context/UserContext';
import studyImg from "../assets/images/study.svg";
import logoImg from "../assets/images/logo-md.png";
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
          {/* Universite nomi */}
          <p
            style={{
              textAlign: "center",
              fontSize: "clamp(10px, 1.2vw, 11px)",
              fontWeight: 600,
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "clamp(10px, 1.8vh, 14px)",
              lineHeight: 1.7,
            }}
          >
            Muhammad al-Xorazmiy nomidagi<br />
            Toshkent Axborot Texnologiyalari<br />
            Universiteti
          </p>

          {/* Logo */}
          <img
            src={logoImg}
            alt="TATU Logo"
            style={{
              width: "clamp(56px, 8vw, 76px)",
              height: "clamp(56px, 8vw, 76px)",
              objectFit: "contain",
              marginBottom: "clamp(12px, 2vh, 18px)",
            }}
          />

          {/* Sarlavha */}
          <h1
            style={{
              fontSize: "clamp(12px, 1.5vw, 15px)",
              fontWeight: 700,
              letterSpacing: "2px",
              color: "#111",
              textAlign: "center",
              marginBottom: "clamp(18px, 3vh, 26px)",
              textTransform: "uppercase",
            }}
          >
            Learning Management System
          </h1>



          {/* Forma */}
          <Loginform />
        </div>

        {/* Footer */}
        <p style={{ fontSize: "clamp(12px, 1.4vw, 15.5px)", color: "#bbb", textAlign: "center" }}>
          Copyright © 2021 of Tashkent University of Information Technologies
        </p>
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
