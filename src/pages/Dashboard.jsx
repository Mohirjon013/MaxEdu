import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  SchoolOutlined,
  PeopleAltOutlined,
  CreditCardOutlined,
  WarningAmberOutlined,
  AcUnitOutlined,
  ArchiveOutlined,
  ExpandMore,
} from "@mui/icons-material";

const stats = [
  { label: "Faol talabalar", value: 52, icon: <SchoolOutlined sx={{ fontSize: 28 }} /> },
  { label: "Guruhlar", value: 23, icon: <PeopleAltOutlined sx={{ fontSize: 28 }} /> },
  { label: "Joriy oy to'lovlar", value: 0, icon: <CreditCardOutlined sx={{ fontSize: 28 }} /> },
  { label: "Qarzdorlar", value: 104, icon: <WarningAmberOutlined sx={{ fontSize: 28 }} /> },
  { label: "Muzlatilganlar", value: 0, icon: <AcUnitOutlined sx={{ fontSize: 28 }} /> },
  { label: "Arxivdagilar", value: 23, icon: <ArchiveOutlined sx={{ fontSize: 28 }} /> },
];

function CustomAccordion({ title }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      disableGutters
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderRadius: "16px !important",
        mb: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore sx={{ color: "text.secondary" }} />}
        sx={{
          minHeight: 64,
          px: 3,
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          Ma'lumot mavjud emas.
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'TEACHER') {
      navigate('/dashboard/groups');
    } else if (role === 'STUDENT') {
      navigate('/dashboard/student-main');
    }
  }, [navigate]);

  return (
    <Box sx={{ pt: 1 }}>
      {/* Greeting */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: "text.primary", letterSpacing: "-0.5px", mb: 0.5 }}>
          Salom, To'ychiboyev Mohirjon!
        </Typography>
        <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
          MaxEdu platformasiga xush kelibsiz!
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        {stats.map((s, index) => (
          <Card
            key={index}
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              transition: "box-shadow 0.2s",
              "&:hover": {
                boxShadow: "0px 4px 12px rgba(107, 75, 232, 0.1)",
              },
            }}
          >
            <Box sx={{ color: "primary.main", mb: 1.5, display: "flex" }}>
              {s.icon}
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary", mb: 1 }}>
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
              {s.value}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* Accordions */}
      <Box sx={{ maxWidth: "100%" }}>
        <CustomAccordion title="Joriy oy uchun to'lovlar" />
        <CustomAccordion title="Yillik Foyda" />
        <CustomAccordion title="Dars jadvali" />
      </Box>
    </Box>
  );
}
