import axios from "axios";

const API_URL = `http://${process.env.REACT_APP_ENDPOINT}:${process.env.REACT_APP_API_PORT}`;

export const register = (username: string, password: string) => {
  return axios.post(API_URL + "/users/register", {
    username,
    password,
  });
};

export const login = (username: string, password: string) => {
  return axios
    .post(API_URL + "/auth/login", {
      username,
      password,
    })
    .then((response) => {
      if (response.data.accessToken) {
        console.log(response.data)
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return response.data;
    });
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);

  return null;
};
