import React, { useContext, useState } from 'react'
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axiosClient from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Context } from '../context/UserContext';


function Loginform() {
    const [showPassword, setShowPassword] = useState(false);
    const { setOpen, setOpenError } = useContext(Context)
    const [input, setInput] = useState({ phone: "", password: "" })

    const navigate = useNavigate();


    function getInfoInput(e) {
        setInput(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function loginUser(e) {
        e.preventDefault()

        try {
            const res = await axiosClient.post('/auth/login', input)
            localStorage.setItem('token', res.data.accessToken)
            localStorage.setItem('refreshToken', res.data.refreshToken)
            localStorage.setItem('role', res.data.role)
            setOpenError(false)
            setOpen(true)
            setTimeout(() => {
                setOpen(false)
                if (res.data.role === 'STUDENT') {
                    navigate('/dashboard/student-main')
                } else {
                    navigate('/dashboard')
                }
                setInput({ phone: '', password: '' })
            }, 1000);

        }
        catch (error) {
            console.log(error);
            setOpenError(true)
            setTimeout(() => {
                setOpenError(false)
                setInput({ phone: '', password: '' })
            }, 1000);
        }
    }
    return (
        <form onSubmit={loginUser} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "clamp(10px, 1.5vh, 14px)" }}>
            {/* Login maydoni */}
            <div>
                <label style={{ display: "block", fontSize: "clamp(12px, 1.2vw, 13px)", color: "#333", marginBottom: 5, fontWeight: 400 }}>
                    Login
                </label>
                <input
                    type="text"
                    name="phone"
                    placeholder="Loginni kiriting"
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
                <label style={{ display: "block", fontSize: "clamp(12px, 1.2vw, 13px)", color: "#333", marginBottom: 5, fontWeight: 400 }}>
                    Parol
                </label>
                <div style={{ position: "relative" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Parolni kiriting"
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
    )
}

export default Loginform
