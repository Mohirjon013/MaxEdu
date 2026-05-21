import { createContext, useState } from "react";


export const Context = createContext()

export const AuthContext = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [openError, setOpenError] = useState(false);


    return (
        <Context.Provider value={{ open, setOpen, openError, setOpenError }}>
            {children}
        </Context.Provider>
    )
}