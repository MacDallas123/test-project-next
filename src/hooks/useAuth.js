import { logoutUser, selectAuthUser } from "@/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const authUserFS = useSelector(selectAuthUser);

    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        if(refreshToken) {
            await dispatch(logoutUser(refreshToken));
            localStorage.clear();

            navigate("/auth/login");
        } else console.log("REFRESH TOKEN IS ABSENT")
    }

    const isLoggedIn = () => {
        const accessToken = localStorage.getItem("accessToken");
        if(accessToken) return true;
        else return false;
    }

    const isIndividual = () => {
        if(authUserFS?.role == "INDIVIDUAL" || authUserFS?.role == "ADMIN") return true;
        else return false;
    }

    const isCandidate = () => {
        if(authUserFS?.role == "CANDIDATE" || authUserFS?.role == "ADMIN") return true;
        else return false;
    }

    const isProfessional = () => {
        if(authUserFS?.role == "PROFESSIONAL" || authUserFS?.role == "PROFESSIONAL" || authUserFS?.role == "ADMIN") return true;
        else return false;
    }

    const isPartner = () => {
        if(authUserFS?.role == "DEFAULT" || authUserFS?.role == "PARTNER" || authUserFS?.role == "ADMIN") return true;
        else return false;
    }

    const isAdmin = () => {
        if(authUserFS?.role == "ADMIN") return true;
        else return false;
    }

    return { user: authUserFS, logout, isLoggedIn, isIndividual, isCandidate, isProfessional, isPartner, isAdmin };
}

export { useAuth };