import React, { useContext, useState, useEffect } from 'react'
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Dialog, Typography, TextField, Button, Box, IconButton, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Context } from '../context/UserContext';


function Loginform() {
    const [showPassword, setShowPassword] = useState(false);
    const { setOpen, setOpenError } = useContext(Context)
    const [input, setInput] = useState({ phone: "", password: "" })
    const [forgotModalOpen, setForgotModalOpen] = useState(false);
    const [forgotPhone, setForgotPhone] = useState("");

    // Forgot Password states
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotCode, setForgotCode] = useState("");
    const [timer, setTimer] = useState(60);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [successToastOpen, setSuccessToastOpen] = useState(false);
    const [errorToastMessage, setErrorToastMessage] = useState("");

    useEffect(() => {
        let interval = null;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);

    const handleSendCode = async (e) => {
        if (e) e.preventDefault();
        try {
            localStorage.removeItem('token');
            const cleanPhone = forgotPhone.replace(/\s+/g, '');
            localStorage.setItem('forgotPhone', cleanPhone);
            await axiosClient.post('/auth/send-otp', { phone: cleanPhone });
            setForgotStep(2);
            setTimer(60);
            setIsTimerActive(true);
        } catch (error) {
            console.log(error);
            setErrorToastMessage("API Xatosi: " + (error?.response?.data?.message || error.message));
        }
    };

    const handleResendCode = async (e) => {
        if (e) e.preventDefault();
        try {
            localStorage.removeItem('token');
            const savedPhone = localStorage.getItem('forgotPhone');
            await axiosClient.post('/auth/send-otp', { phone: savedPhone });
            setTimer(60);
            setIsTimerActive(true);
        } catch (error) {
            console.log(error);
            setErrorToastMessage("API Xatosi: " + (error?.response?.data?.message || error.message));
        }
    };

    const handleVerifyCode = async (e) => {
        if (e) e.preventDefault();
        try {
            localStorage.removeItem('token');
            const savedPhone = localStorage.getItem('forgotPhone');
            await axiosClient.post('/auth/verify-otp', { phone: savedPhone, otp: forgotCode });
            setForgotStep(3);
        } catch (error) {
            console.log(error);
            setErrorToastMessage("API Xatosi (Tasdiqlash): " + (error?.response?.data?.message || error.message));
        }
    };

    const handleChangePassword = async (e) => {
        if (e) e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError("Parollar mos kelmadi!");
            return;
        }
        setPasswordError("");
        try {
            localStorage.removeItem('token');
            const savedPhone = localStorage.getItem('forgotPhone');
            await axiosClient.put('/auth/change-password', { phone: savedPhone, password: newPassword });
            localStorage.removeItem('forgotPhone');
            setForgotModalOpen(false);
            setForgotStep(1);
            setNewPassword("");
            setConfirmPassword("");
            setForgotCode("");
            setSuccessToastOpen(true);
        } catch (error) {
            console.log(error);
            setErrorToastMessage("API Xatosi (Parol yangilash): " + (error?.response?.data?.message || error.message));
        }
    };

    const navigate = useNavigate();

    function getInfoInput(e) {
        setInput(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function loginUser(e) {
        e.preventDefault()
        try {
            const payload = {
                ...input,
                phone: input.phone.replace(/\s+/g, '')
            };
            const res = await axiosClient.post('/auth/login', payload)
            localStorage.setItem('token', res.data.accessToken)
            localStorage.setItem('refreshToken', res.data.refreshToken)
            localStorage.setItem('role', res.data.role)
            setOpenError(false)
            setOpen(true)
            setTimeout(() => {
                setOpen(false)
                if (res.data.role === 'STUDENT') {
                    navigate('/dashboard/student-main')
                } else if (res.data.role === 'TEACHER') {
                    navigate('/dashboard/groups')
                } else {
                    navigate('/dashboard')
                }
                setInput({ phone: '', password: '' })
            }, 1000);
        } catch (error) {
            console.log(error);
            setOpenError(true)
            setTimeout(() => {
                setOpenError(false)
                setInput({ phone: '', password: '' })
            }, 1000);
        }
    }

    const closeModal = () => {
        setForgotModalOpen(false);
        setForgotStep(1);
        setIsTimerActive(false);
        setForgotCode("");
    };

    return (
        <>
            <form onSubmit={loginUser} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "clamp(10px, 1.5vh, 14px)" }}>
                {/* Login maydoni */}
                <div>
                    <input
                        type="text"
                        name="phone"
                        placeholder="Login"
                        value={input.phone}
                        onChange={getInfoInput}
                        className="placeholder:text-[#aaa] w-full outline-none"
                        style={{
                            border: "1px solid #c4c4c4",
                            borderRadius: 4,
                            padding: "clamp(6px, 1vh, 8px) 12px",
                            fontSize: "clamp(13px, 1.3vw, 14px)",
                            color: "#333",
                            boxSizing: "border-box",
                            transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = "#1C2B57";
                            e.target.style.boxShadow = "0 0 0 3px rgba(28,43,87,0.12)";
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = "#c4c4c4";
                            e.target.style.boxShadow = "none";
                        }}
                    />
                </div>

                {/* Parol maydoni */}
                <div>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Parol"
                            value={input.password}
                            onChange={getInfoInput}
                            className="placeholder:text-[#aaa] w-full outline-none"
                            style={{
                                border: "1px solid #c4c4c4",
                                borderRadius: 4,
                                padding: "clamp(6px, 1vh, 8px) 40px clamp(6px, 1vh, 8px) 12px",
                                fontSize: "clamp(13px, 1.3vw, 14px)",
                                color: "#333",
                                boxSizing: "border-box",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = "#1C2B57";
                                e.target.style.boxShadow = "0 0 0 3px rgba(28,43,87,0.12)";
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = "#c4c4c4";
                                e.target.style.boxShadow = "none";
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            style={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#777",
                                padding: 4,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </button>
                    </div>
                    <div style={{ textAlign: "right", marginTop: 4 }}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); setForgotModalOpen(true); }}
                            style={{
                                fontSize: "clamp(12px, 1.1vw, 13px)",
                                color: "#1C2B57",
                                textDecoration: "none",
                                fontWeight: 400
                            }}
                            onMouseOver={e => e.currentTarget.style.textDecoration = "underline"}
                            onMouseOut={e => e.currentTarget.style.textDecoration = "none"}
                        >
                            Parolni unutdingizmi?
                        </a>
                    </div>
                </div>

                {/* Kirish tugmasi */}
                <button
                    type="submit"
                    style={{
                        backgroundColor: "#1C2B57",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "clamp(8px, 1.2vh, 11px) 0",
                        fontSize: "clamp(13px, 1.3vw, 14px)",
                        fontWeight: 500,
                        letterSpacing: "0.5px",
                        cursor: "pointer",
                        width: "100%",
                        marginTop: 4,
                        transition: "background-color 0.2s",
                        fontFamily: "'Roboto', sans-serif",
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = "#16305c"}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = "#1C2B57"}
                >
                    Kirish
                </button>
            </form>

            {/* Forgot Password Modal */}
            <Dialog
                open={forgotModalOpen}
                onClose={closeModal}
                sx={{ zIndex: 99999 }}
                slotProps={{ paper: { sx: { borderRadius: '5px', overflow: 'hidden', m: 1 } } }}
            >
                <Box sx={{ p: 3, width: '550px', minHeight: '250px', overflowX: 'hidden', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '22px', color: '#111827' }}>
                            {forgotStep === 1 ? 'Parolni tiklash' : 'SMS kodni tasdiqlash'}
                        </Typography>
                        <IconButton onClick={closeModal} sx={{ color: '#9CA3AF', p: 0.5, mt: -0.5, mr: -0.5 }}>
                            <CloseIcon sx={{ fontSize: 25 }} />
                        </IconButton>
                    </Box>

                    {/* Step 1: Phone input */}
                    {forgotStep === 1 && (
                        <>
                            <Typography sx={{ fontSize: '14px', color: '#6B7280', mb: 4, lineHeight: '20px' }}>
                                Tizimda ro'yxatdan o'tgan telefon raqamingizni kiriting. Biz sizga tasdiqlash kodini yuboramiz.
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                label="Telefon raqami"
                                placeholder="+998930002020"
                                value={forgotPhone}
                                onChange={(e) => setForgotPhone(e.target.value)}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    mb: 4,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px',
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1C2B57',
                                            borderWidth: '1px',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#1C2B57',
                                    }
                                }}
                            />

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 'auto' }}>
                                <Button
                                    onClick={closeModal}
                                    sx={{
                                        bgcolor: '#fff',
                                        color: '#374151',
                                        border: '1px solid #E5E7EB',
                                        px: 2, py: 1,
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        boxShadow: 'none',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#F9FAFB' }
                                    }}
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSendCode}
                                    disabled={!forgotPhone}
                                    sx={{
                                        bgcolor: '#1C2B57',
                                        color: '#fff',
                                        px: 2, py: 1,
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        boxShadow: 'none',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#16305c', boxShadow: 'none' },
                                        '&.Mui-disabled': { bgcolor: '#9ca3af', color: '#fff' }
                                    }}
                                >
                                    Kodni yuborish
                                </Button>
                            </Box>
                        </>
                    )}

                    {/* Step 2: OTP input */}
                    {forgotStep === 2 && (
                        <>
                            <Typography sx={{ fontSize: '14px', color: '#111827', mb: 0.5, lineHeight: '20px' }}>
                                Tasdiqlash kodi quyidagi raqamga yuborildi: <span style={{ fontWeight: 700 }}>{forgotPhone || localStorage.getItem('forgotPhone')}</span>
                            </Typography>
                            <Typography
                                component="span"
                                onClick={() => { setForgotStep(1); setIsTimerActive(false); }}
                                sx={{ fontSize: '14px', color: '#111827', textDecoration: 'underline', cursor: 'pointer', mb: 3, display: 'inline-block' }}
                            >
                                O'zgartirish
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                placeholder="SMS Kod"
                                value={forgotCode}
                                onChange={(e) => setForgotCode(e.target.value)}
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px',
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1C2B57',
                                            borderWidth: '1px',
                                        },
                                    }
                                }}
                            />

                            <Box sx={{ mb: 2 }}>
                                {timer > 0 ? (
                                    <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                                        Kodni qayta jo'natish: <span style={{ fontWeight: 700, color: '#111827' }}>{timer} soniya</span>
                                    </Typography>
                                ) : (
                                    <Typography
                                        component="span"
                                        onClick={handleResendCode}
                                        sx={{
                                            fontSize: '14px',
                                            color: '#111827',
                                            fontWeight: 700,
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            '&:hover': { color: '#1C2B57' }
                                        }}
                                    >
                                        Kodni qayta jo'natish
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 'auto', alignItems: 'center' }}>
                                <Button
                                    onClick={closeModal}
                                    disableRipple
                                    sx={{
                                        color: '#6B7280',
                                        px: 2, py: 1,
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'transparent', color: '#4B5563' }
                                    }}
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleVerifyCode}
                                    disabled={!forgotCode}
                                    sx={{
                                        bgcolor: '#1C2B57',
                                        color: '#fff',
                                        px: 3, py: 1,
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        boxShadow: 'none',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#16305c', boxShadow: 'none' },
                                        '&.Mui-disabled': { bgcolor: '#9ca3af', color: '#fff' }
                                    }}
                                >
                                    Kodni tasdiqlash
                                </Button>
                            </Box>
                        </>
                    )}

                    {/* Step 3: New Password */}
                    {forgotStep === 3 && (
                        <>
                            <Typography sx={{ fontSize: '14px', color: '#6B7280', mb: 3, lineHeight: '20px' }}>
                                Hisobingiz uchun yangi xavfsiz parol kiriting.
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                type="password"
                                placeholder="Yangi parol"
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px',
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1C2B57',
                                            borderWidth: '1px',
                                        },
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                type="password"
                                placeholder="Parolni tasdiqlash"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                                variant="outlined"
                                sx={{
                                    mb: passwordError ? 1 : 4,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px',
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1C2B57',
                                            borderWidth: '1px',
                                        },
                                    }
                                }}
                            />

                            {passwordError && (
                                <Typography sx={{ fontSize: '12px', color: '#EF4444', mb: 3 }}>
                                    {passwordError}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 'auto', alignItems: 'center' }}>
                                <Button
                                    onClick={closeModal}
                                    disableRipple
                                    sx={{
                                        color: '#6B7280',
                                        px: 2, py: 1,
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'transparent', color: '#4B5563' }
                                    }}
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleChangePassword}
                                    disabled={!newPassword || !confirmPassword}
                                    sx={{
                                        bgcolor: '#1C2B57',
                                        color: '#fff',
                                        px: 3, py: 1,
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        boxShadow: 'none',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#16305c', boxShadow: 'none' },
                                        '&.Mui-disabled': { bgcolor: '#9ca3af', color: '#fff' }
                                    }}
                                >
                                    Parolni yangilash
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Dialog>

            {/* Success Toast */}
            <Snackbar 
                open={successToastOpen} 
                autoHideDuration={3000} 
                onClose={() => setSuccessToastOpen(false)} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ zIndex: 100000 }}
            >
                <Alert onClose={() => setSuccessToastOpen(false)} severity="success" sx={{ width: '100%' }}>
                    Parol muvaffaqiyatli o'zgartirildi!
                </Alert>
            </Snackbar>

            {/* Error Toast */}
            <Snackbar 
                open={!!errorToastMessage} 
                autoHideDuration={4000} 
                onClose={() => setErrorToastMessage("")} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ zIndex: 100000 }}
            >
                <Alert onClose={() => setErrorToastMessage("")} severity="error" sx={{ width: '100%' }}>
                    {errorToastMessage}
                </Alert>
            </Snackbar>
        </>
    )
}

export default Loginform
