import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, LinearProgress, Chip, Avatar } from "@mui/material";
import {
  CardGiftcard,
  AutoAwesome,
  BuildOutlined,
  RocketLaunchOutlined,
  StarOutlined,
  DesignServicesOutlined,
} from "@mui/icons-material";

const PURPLE_MAIN = "#6B4BE8";
const PURPLE_LIGHT = "#8B6FF0";
const PURPLE_DARK = "#4A32B0";

// Floating particles component
function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? PURPLE_MAIN : PURPLE_LIGHT,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        borderRadius: "24px",
      }}
    />
  );
}

// Animated feature card
function FeatureCard({ icon, label, delay }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2.5,
        py: 1.5,
        borderRadius: "14px",
        backgroundColor: "rgba(107, 75, 232, 0.07)",
        border: "1px solid rgba(107, 75, 232, 0.15)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.5s ease, transform 0.5s ease`,
        cursor: "default",
        "&:hover": {
          backgroundColor: "rgba(107, 75, 232, 0.12)",
          border: "1px solid rgba(107, 75, 232, 0.3)",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 16px rgba(107, 75, 232, 0.12)",
        },
      }}
    >
      <Box sx={{ color: PURPLE_MAIN, display: "flex" }}>{icon}</Box>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function Gifs() {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(".");
  const [pulse, setPulse] = useState(false);

  // Animate progress bar
  useEffect(() => {
    const targets = [15, 32, 48, 61, 74, 85];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < targets.length) {
        setProgress(targets[idx]);
        idx++;
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Pulse icon
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <StarOutlined sx={{ fontSize: 18 }} />, label: "Sovg'a reytingi tizimi", delay: 300 },
    { icon: <CardGiftcard sx={{ fontSize: 18 }} />, label: "Talabalar uchun mukofotlar", delay: 500 },
    { icon: <AutoAwesome sx={{ fontSize: 18 }} />, label: "Avtomatik sovg'a berish", delay: 700 },
    { icon: <DesignServicesOutlined sx={{ fontSize: 18 }} />, label: "Shaxsiy dizayn tanlash", delay: 900 },
    { icon: <RocketLaunchOutlined sx={{ fontSize: 18 }} />, label: "Gamifikatsiya tizimi", delay: 1100 },
    { icon: <BuildOutlined sx={{ fontSize: 18 }} />, label: "Admin boshqaruvi", delay: 1300 },
  ];

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 100px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 680,
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Glow background blob */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(107,75,232,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Main card */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            background: "#FFFFFF",
            borderRadius: "28px",
            border: "1px solid rgba(107, 75, 232, 0.15)",
            boxShadow:
              "0 4px 6px rgba(0,0,0,0.02), 0 20px 60px rgba(107,75,232,0.08)",
            overflow: "hidden",
            px: { xs: 3, sm: 6 },
            py: 5,
          }}
        >
          {/* Particles canvas */}
          <Particles />

          {/* Top badge */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Chip
              label="Tez kunda"
              size="small"
              sx={{
                backgroundColor: "rgba(107, 75, 232, 0.1)",
                color: PURPLE_MAIN,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.5px",
                border: "1px solid rgba(107, 75, 232, 0.2)",
                height: 28,
                animation: "chipPulse 2s ease-in-out infinite",
                "@keyframes chipPulse": {
                  "0%, 100%": { boxShadow: "0 0 0 0 rgba(107,75,232,0.2)" },
                  "50%": { boxShadow: "0 0 0 6px rgba(107,75,232,0)" },
                },
              }}
            />
          </Box>

          {/* Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: "28px",
                background: `linear-gradient(135deg, ${PURPLE_MAIN} 0%, ${PURPLE_LIGHT} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 8px 32px rgba(107, 75, 232, 0.35)`,
                transform: pulse ? "scale(1.06) rotate(3deg)" : "scale(1) rotate(0deg)",
                transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: -4,
                  borderRadius: "32px",
                  background: `linear-gradient(135deg, ${PURPLE_MAIN}40, ${PURPLE_LIGHT}20)`,
                  zIndex: -1,
                },
              }}
            >
              <CardGiftcard sx={{ fontSize: 44, color: "#FFFFFF" }} />
            </Box>
          </Box>

          {/* Title */}
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 26, sm: 32 },
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.8px",
              mb: 1.5,
              lineHeight: 1.2,
            }}
          >
            Sovg'alar moduli
          </Typography>

          {/* Subtitle with animated dots */}
          <Typography
            sx={{
              fontSize: 16,
              color: "#6B7280",
              mb: 1,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Ishlanmoqda
            <Box
              component="span"
              sx={{
                display: "inline-block",
                minWidth: 20,
                color: PURPLE_MAIN,
                fontWeight: 700,
              }}
            >
              {dots}
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              color: "#9CA3AF",
              mb: 4,
              maxWidth: 400,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Bu bo'lim hozirda ishlab chiqilmoqda. Tez orada talabalar uchun
            kuchli sovg'a va mukofot tizimi taqdim etiladi.
          </Typography>

          {/* Progress */}
          <Box sx={{ mb: 4, px: { xs: 0, sm: 2 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
              >
                Tayyorgarlik jarayoni
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: PURPLE_MAIN,
                }}
              >
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 999,
                backgroundColor: "rgba(107, 75, 232, 0.1)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${PURPLE_DARK}, ${PURPLE_MAIN}, ${PURPLE_LIGHT})`,
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s linear infinite",
                },
                "@keyframes shimmer": {
                  "0%": { backgroundPosition: "200% center" },
                  "100%": { backgroundPosition: "-200% center" },
                },
                transition: "all 0.5s ease",
              }}
            />
          </Box>

          {/* Divider */}
          <Box
            sx={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(107,75,232,0.15), transparent)",
              mb: 4,
            }}
          />

          {/* Features grid */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "1px",
                mb: 2.5,
              }}
            >
              Kelayotgan imkoniyatlar
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
                textAlign: "left",
              }}
            >
              {features.map((f, i) => (
                <FeatureCard
                  key={i}
                  icon={f.icon}
                  label={f.label}
                  delay={f.delay}
                />
              ))}
            </Box>
          </Box>

          {/* Bottom team avatars */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid #F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex" }}>
              {["#6B4BE8", "#8B6FF0", "#A855F7"].map((c, i) => (
                <Avatar
                  key={i}
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: c,
                    fontSize: 11,
                    fontWeight: 700,
                    ml: i > 0 ? -0.8 : 0,
                    border: "2px solid #FFF",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {["M", "T", "D"][i]}
                </Avatar>
              ))}
            </Box>
            <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>
              Jamoa tomonidan ishlanmoqda
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#10B981",
                boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
                animation: "livePulse 1.5s ease-in-out infinite",
                "@keyframes livePulse": {
                  "0%, 100%": { boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.4)" },
                  "50%": { boxShadow: "0 0 0 6px rgba(16, 185, 129, 0)" },
                },
              }}
            />
          </Box>
        </Box>

        {/* Floating decorative elements */}
        {[
          { top: -20, right: 40, size: 40, delay: "0s", color: PURPLE_MAIN + "20" },
          { top: 60, left: -15, size: 24, delay: "0.5s", color: PURPLE_LIGHT + "30" },
          { bottom: 30, right: -10, size: 32, delay: "1s", color: PURPLE_DARK + "20" },
          { bottom: -15, left: 60, size: 20, delay: "1.5s", color: PURPLE_MAIN + "15" },
        ].map((el, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: el.top,
              bottom: el.bottom,
              left: el.left,
              right: el.right,
              width: el.size,
              height: el.size,
              borderRadius: "50%",
              backgroundColor: el.color,
              zIndex: 0,
              animation: `float${i} 4s ease-in-out infinite`,
              animationDelay: el.delay,
              [`@keyframes float${i}`]: {
                "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
                "50%": { transform: "translateY(-10px) rotate(180deg)" },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
