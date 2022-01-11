import { createContext } from "react";
import { getCurrentUser } from "../services/auth.service"

export const user = getCurrentUser();

export const UserContext = createContext(user);