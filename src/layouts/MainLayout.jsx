import React, { useState, useContext } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import bellImg from '../assets/images/bell.png'
import { ThemeContext } from "../context/ThemeContext";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
  IconButton,
  Button,
  InputBase,
  Avatar,
  Paper,
  Tooltip,
  Collapse,
  Popover,
} from "@mui/material";
import {
  Home,
  Person,
  Group,
  Diamond,
  CardGiftcard,
  Settings,
  Public,
  ChevronLeft,
  CalendarMonthOutlined,
  SearchRounded,
  NotificationsNoneOutlined,
  DarkModeOutlined,
  LightModeOutlined,
  KeyboardArrowDownRounded,
  LogoutOutlined,
  AutorenewOutlined,
  KeyboardArrowDown,
  CategoryOutlined,
  MeetingRoomOutlined,
  DomainOutlined,
  LocalOfferOutlined,
  AccountTreeOutlined,
  MonetizationOnOutlined,
  ChatBubbleOutlineOutlined,
  HelpOutlineOutlined,
  SecurityOutlined,
  MenuBookOutlined,
  BadgeOutlined,
  SendOutlined,
  Add,
  School,
  CreditCard,
  Groups,
  BarChart,
  Equalizer,
  ShoppingCart,
  OnlinePrediction,
} from "@mui/icons-material";

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 88;
const PURPLE_MAIN = "#6B4BE8";



const subMenuItems = [
  { text: "Kurslar", icon: <MenuBookOutlined />, path: "/management/course" },
  { text: "Xonalar", icon: <MeetingRoomOutlined />, path: "/management/room" },
  { text: "Hodimlar", icon: <BadgeOutlined /> },
  { text: "Coin", icon: <MonetizationOnOutlined /> },
  { text: "Xabar Yuborish", icon: <SendOutlined /> },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [managementOpen, setManagementOpen] = useState(pathname === "/management");
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [openMenus, setOpenMenus] = useState({ "Guruhlar": true });
  const [profileAnchor, setProfileAnchor] = useState(null);

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const profileOpen = Boolean(profileAnchor);

  const toggleMenu = (menuText) => {
    setOpenMenus((prev) => ({ ...prev, [menuText]: !prev[menuText] }));
  };

  const userRole = localStorage.getItem('role');

  const ROLE_LABELS = {
    SUPERADMIN: 'SUPERADMIN',
    TEACHER: "TEACHER",
    STUDENT: "STUDENT",
  };
  const roleLabel = ROLE_LABELS[userRole] || userRole;

  let currentMenuItems = [];

  if (userRole === "STUDENT") {
    currentMenuItems = [
      { text: "Bosh sahifa", icon: <Home />, path: "/dashboard/student-main" },
      { text: "To'lovlarim", icon: <CreditCard />, path: "/dashboard/payments" },
      { text: "Guruhlarim", icon: <Groups />, path: "/dashboard/my-groups" },
      { text: "Ko'rsatkichlarim", icon: <BarChart />, path: "/dashboard/stats" },
      { text: "Reyting", icon: <Equalizer />, path: "/dashboard/rating" },
      { text: "Do'kon", icon: <ShoppingCart />, path: "/dashboard/shop" },
      { text: "Qo'shimcha darslar", icon: <OnlinePrediction />, path: "/dashboard/extra-lessons" },
      { text: "Sozlamalar", icon: <Settings />, path: "/dashboard/settings" },
    ];
  } else if (userRole === "TEACHER") {
    currentMenuItems = [
      {
        text: "Guruhlar",
        icon: <Groups />,
        subItems: [
          { text: "Guruhlar", path: "/dashboard/groups" },
          { text: "Yig'ilayotgan guruhlar", path: "/dashboard/assembling-groups" },
        ]
      },
      { text: "Profil", icon: <Person />, path: "/dashboard/profile" },
    ];
  } else {
    currentMenuItems = [
      { text: "Asosiy", icon: <Home />, path: "/dashboard" },
      { text: "O'qituvchilar", icon: <Person />, path: "/dashboard/teacher" },
      { text: "Guruhlar", icon: <Group />, path: "/dashboard/groups" },
      { text: "Talabalar", icon: <Diamond />, path: "/dashboard/students" },
      { text: "Sovg'alar", icon: <CardGiftcard />, path: "/dashboard/gifts" },
      { text: "Boshqarish", icon: <Settings />, path: "/management" },
    ];
  }

  const sidebarW = collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const handleMenuClick = (item) => {
    if (item.text === "Boshqarish") {
      setManagementOpen(true);
      navigate("/management");
    } else {
      setManagementOpen(false);
      navigate(item.path);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "background.default", overflow: "hidden", fontFamily: "Roboto, sans-serif", position: "relative" }}>

      {/* ════ SIDEBAR ════ */}
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarW,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarW,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            borderRadius: "0 24px 24px 0",
            transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
            overflowX: "hidden", // FIXED SCROLLBAR ISSUE
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
          },
        }}
      >
        {/* Logo Area */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", px: collapsed ? 0 : 3, pt: 1, pb: 1, minHeight: 70, borderBottom: "1px solid", borderColor: "divider", mb: 4 }}>
          <Box
            onClick={() => navigate("/dashboard")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
          >
            <School sx={{ fontSize: 40, color: PURPLE_MAIN }} />
            {!collapsed && (
              <Typography sx={{ fontWeight: 700, fontSize: 22, color: PURPLE_MAIN, letterSpacing: "-0.5px" }}>
                MaxEdu
              </Typography>
            )}
          </Box>
        </Box>

        {/* Menu Items */}
        <Box sx={{ flex: 1, px: collapsed ? 2 : 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          <List disablePadding>
            {currentMenuItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isActive = !hasSubItems && (item.path === "/dashboard"
                ? pathname === "/dashboard"
                : (item.path && pathname.startsWith(item.path)));

              return (
                <React.Fragment key={item.text}>
                  <ListItem disablePadding sx={{ mb: hasSubItems && openMenus[item.text] ? 0.5 : 1, justifyContent: "center" }}>
                    <Tooltip title={collapsed ? item.text : ""} placement="right" arrow>
                      <ListItemButton
                        onClick={() => hasSubItems ? toggleMenu(item.text) : handleMenuClick(item)}
                        sx={{
                          minHeight: 47,
                          width: "100%",
                          justifyContent: collapsed ? "center" : "flex-start",
                          px: collapsed ? 0 : 2,
                          py: 1,
                          borderRadius: "14px",
                          backgroundColor: isActive ? PURPLE_MAIN : "transparent",
                          color: isActive ? "#FFF" : "text.secondary",
                          "&:hover": {
                            backgroundColor: isActive ? PURPLE_MAIN : (mode === 'dark' ? "rgba(107, 75, 232, 0.15)" : "#F3E8FF"),
                          },
                          "&:hover .menu-icon": {
                            color: isActive ? "#FFF" : PURPLE_MAIN,
                          },
                          "&:hover .menu-text": {
                            color: isActive ? "#FFF" : PURPLE_MAIN,
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        <ListItemIcon
                          className="menu-icon"
                          sx={{
                            minWidth: 0,
                            mr: collapsed ? 0 : 2.5,
                            justifyContent: "center",
                            color: isActive ? "#FFF" : "text.secondary",
                            transition: "color 0.3s ease",
                          }}
                        >
                          {React.cloneElement(item.icon, { sx: { fontSize: 24 } })}
                        </ListItemIcon>
                        {!collapsed && (
                          <>
                            <Typography
                              className="menu-text"
                              sx={{
                                fontSize: 15,
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? "#FFF" : "text.primary",
                                flex: 1,
                                transition: "color 0.3s ease",
                              }}
                            >
                              {item.text}
                            </Typography>
                            {hasSubItems && (
                              <KeyboardArrowDown
                                sx={{
                                  color: "text.secondary",
                                  transform: openMenus[item.text] ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.3s"
                                }}
                              />
                            )}
                          </>
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>

                  {/* SUB ITEMS */}
                  {hasSubItems && !collapsed && (
                    <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.path || pathname.startsWith(subItem.path + '/');
                          return (
                            <ListItem key={subItem.text} disablePadding sx={{ mb: 1, px: 2 }}>
                              <ListItemButton
                                onClick={() => handleMenuClick(subItem)}
                                sx={{
                                  minHeight: 45,
                                  width: "100%",
                                  borderRadius: "14px",
                                  backgroundColor: isSubActive ? PURPLE_MAIN : "transparent",
                                  color: isSubActive ? "#FFF" : "text.secondary",
                                  "&:hover": {
                                    backgroundColor: isSubActive ? PURPLE_MAIN : (mode === 'dark' ? "rgba(107, 75, 232, 0.15)" : "#F3E8FF"),
                                    color: isSubActive ? "#FFF" : PURPLE_MAIN,
                                  },
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <Typography sx={{ fontSize: 14, fontWeight: isSubActive ? 600 : 500, flex: 1, pl: 1 }}>
                                  {subItem.text}
                                </Typography>
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            })}
          </List>
        </Box>

        {/* Subscription Card */}
        {!collapsed && userRole !== "STUDENT" && userRole !== "TEACHER" && (
          <Box sx={{ mx: 2.5, mb: 1.5, p: 1.5, borderRadius: "16px", backgroundColor: mode === 'dark' ? "rgba(220, 38, 38, 0.1)" : "#FCEDED", border: mode === 'dark' ? "1px solid rgba(220, 38, 38, 0.2)" : "1px solid #FAD4D4" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              {/* Bell emoji for 3D look */}
              <img src={bellImg} alt="bell-img" width={35} height={35} />
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary", lineHeight: 1.2, mb: 0.5 }}>
                  Obuna
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#EF4444", lineHeight: 1.2 }}>
                  Obunangiz tugagan
                </Typography>
              </Box>
            </Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutorenewOutlined sx={{ fontSize: 18 }} />}
              sx={{
                backgroundColor: "#DC2626",
                color: "#FFF",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                py: 1.2,
                borderRadius: "10px",
                boxShadow: "0px 2px 4px rgba(220, 38, 38, 0.2)",
                "&:hover": { backgroundColor: "#B91C1C" },
              }}
            >
              Obunani yangilash
            </Button>
          </Box>
        )}

        {/* Logout removed — moved to Avatar dropdown */}
      </Drawer>

      {/* ════ COLLAPSE BUTTON - PLACED OUTSIDE DRAWER TO PREVENT SCROLLBAR ════ */}
      <IconButton
        onClick={() => setCollapsed(!collapsed)}
        sx={{
          position: "absolute",
          left: sidebarW - 16, // AT THE EXACT BORDER LINE
          top: 40, // CENTERED VERTICALLY IN THE LOGO AREA (minHeight: 80 / 2)
          transform: "translateY(-50%)",
          zIndex: 11, // Ustiga chiqib qolmasligi uchun 1300 dan 11 ga tushirildi
          width: 32,
          height: 32,
          borderRadius: "10px",
          backgroundColor: PURPLE_MAIN,
          color: "#FFF",
          "&:hover": { backgroundColor: "#5a3cd9" },
          boxShadow: "0 2px 8px rgba(107, 75, 232, 0.3)",
          border: "2px solid",
          borderColor: "background.paper",
          transition: "left 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s",
        }}
      >
        <ChevronLeft sx={{ fontSize: 18, transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
      </IconButton>

      {/* ══════════ SUB MENU DRAWER (Boshqarish) ══════════ */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={managementOpen}
        sx={{
          width: 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 280,
            left: sidebarW,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            borderRadius: "0 24px 24px 0",
            boxShadow: managementOpen ? "4px 0 15px rgba(0,0,0,0.05)" : "none",
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s",
            zIndex: 9,
          },
        }}
      >
        <Box sx={{ pb: 2, px: 3, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ position: "relative", display: "flex", alignItems: "center", px: 3, minHeight: 80, borderBottom: "1px solid", borderColor: "divider", mb: 2 }}>

            <Typography sx={{ fontSize: 20, fontWeight: 700, color: "text.primary", letterSpacing: "-0.5px" }}>
              Menu
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <List disablePadding>
              {subMenuItems.map((sub) => {
                const isActive = pathname === sub.path;
                return (
                  <ListItem key={sub.text} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        if (sub.path) {
                          navigate(sub.path);
                          setManagementOpen(false);
                        }
                      }}
                      sx={{
                        borderRadius: "12px",
                        px: 2,
                        py: 1.5,
                        backgroundColor: isActive ? (mode === 'dark' ? "#374151" : "#F3F4F6") : "transparent",
                        color: isActive ? PURPLE_MAIN : "text.secondary",
                        "&:hover": { backgroundColor: mode === 'dark' ? "#374151" : "#F3F4F6", color: PURPLE_MAIN },
                        transition: "all 0.2s"
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, mr: 2, color: "inherit" }}>
                        {React.cloneElement(sub.icon, { sx: { fontSize: 22 } })}
                      </ListItemIcon>
                      <Typography sx={{ fontSize: 15, fontWeight: isActive ? 600 : 500, flex: 1 }}>
                        {sub.text}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* ════ MAIN CONTENT ════ */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* OVERLAY */}
        {managementOpen && (
          <Box
            onClick={() => setManagementOpen(false)}
            sx={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.15)",
              zIndex: 8,
              cursor: "pointer"
            }}
          />
        )}
        {/* TOP NAVBAR */}
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", px: 4, minHeight: 80, gap: 2, flexShrink: 0, backgroundColor: "background.default" }}>

          {/* Calendar Button */}
          <IconButton sx={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: "background.paper", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", ml: 0 }}>
            <CalendarMonthOutlined sx={{ fontSize: 20, color: "text.secondary" }} />
          </IconButton>

          {/* Plus Button */}
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: 18 }} />}
            endIcon={<KeyboardArrowDown sx={{ fontSize: 18 }} />}
            sx={{
              height: 36, px: 2, borderRadius: "8px", backgroundColor: PURPLE_MAIN, color: "#FFF",
              fontSize: 14, fontWeight: 600, textTransform: "none", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              "&:hover": { backgroundColor: "#5a3cd9" },
            }}
          >
            Qo'shish
          </Button>


          {/* Search */}
          <Paper
            elevation={0}
            sx={{ display: "flex", alignItems: "center", width: 280, height: 36, px: 1.5, borderRadius: "8px", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", backgroundColor: "background.paper" }}
          >
            <SearchRounded sx={{ color: "text.secondary", fontSize: 20, mr: 1 }} />
            <InputBase placeholder="Qidirish..." sx={{ ml: 1, flex: 1, fontSize: 14, color: "text.primary" }} />
          </Paper>

          {/* Right Side */}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              endIcon={<KeyboardArrowDownRounded sx={{ color: "text.secondary" }} />}
              sx={{
                height: 36, px: 2, borderRadius: "8px", backgroundColor: "background.paper", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                color: "text.secondary", textTransform: "none", fontSize: 14, fontWeight: 500, "&:hover": { backgroundColor: mode === 'dark' ? "#374151" : "#F9FAFB" }
              }}
            >
              O'zbekcha
            </Button>
            <IconButton sx={{ color: "text.secondary", ml: 1 }}>
              <NotificationsNoneOutlined sx={{ fontSize: 22 }} />
            </IconButton>
            <IconButton onClick={toggleTheme} sx={{ color: "text.secondary" }}>
              {mode === 'dark' ? <LightModeOutlined sx={{ fontSize: 22 }} /> : <DarkModeOutlined sx={{ fontSize: 22 }} />}
            </IconButton>
            <Tooltip title="" placement="bottom" arrow>
              <Avatar
                onClick={handleProfileOpen}
                sx={{
                  width: 36, height: 36, backgroundColor: PURPLE_MAIN, fontSize: 16, fontWeight: 700,
                  cursor: "pointer", ml: 1,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "scale(1.1)", boxShadow: "0 4px 14px rgba(107,75,232,0.4)" }
                }}
              >
                {(userRole || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>

            {/* Profile Popover */}
            <Popover
              open={profileOpen}
              anchorEl={profileAnchor}
              onClose={handleProfileClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 0.5,
                  borderRadius: '12px',
                  width: 200,          // fixed width
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '0.5px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  backgroundColor: 'background.paper',
                  p: 0,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.75, py: 1.25 }}>
                <Box sx={{ width: 36, height: 36, flexShrink: 0 }}>  {/* wrapper — Avatar stretch oldini oladi */}
                  <Avatar sx={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(107,75,232,0.15)',
                    color: '#7C3AED',
                    fontSize: 14,
                    fontWeight: 700,
                  }}>
                    {(userRole || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: 'text.primary',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                }}>
                  {roleLabel}
                </Typography>
              </Box>

              <Box sx={{ height: '0.5px', backgroundColor: 'divider' }} />

              <Box
                onClick={() => {
                  handleProfileClose();
                  localStorage.clear();
                  navigate('/login');
                }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.25,
                  px: 1.75, py: 1.25,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgba(239,68,68,0.08)' : '#FEF2F2'
                  }
                }}
              >
                <LogoutOutlined sx={{ fontSize: 17, color: '#EF4444' }} />
                <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#EF4444' }}>
                  Chiqish
                </Typography>
              </Box>
            </Popover>
          </Box>
        </Box>

        {/* PAGE CONTENT */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 4, pb: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
