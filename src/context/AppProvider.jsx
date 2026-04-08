"use client";

import { createContext, useContext, useState } from "react";

const appMainContext = createContext();


export function useAppMainContext() {
    return useContext(appMainContext);
}

const AppProvider = ({ children }) => {
    const [ isViewLocked, setIsViewLocked ] = useState(false);

    const value = {
        isViewLocked, setIsViewLocked
    };

    return <appMainContext.Provider value={value}>{ children }</appMainContext.Provider>
}

export default AppProvider;