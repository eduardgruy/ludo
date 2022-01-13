import React from "react";
import { useState, useLayoutEffect } from "react";
import { Route, Link, Switch, useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import io from 'socket.io-client'

import { SocketContext } from './context/socket';
import { UserContext } from './context/user';

import * as AuthService from "./services/auth.service";
import IUser from './types/user.type';

import Login from "./components/Login";
import Register from "./components/Register";
import Lobby from "./components/Lobby";
import Profile from "./components/Profile";
import Game from "./components/Game"
import Player from "./components/Music";

import EventBus from "./common/EventBus";


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<IUser | undefined>(undefined);
  const [socket, setSocket] = useState<any>(undefined);
  const history = useHistory()
  useLayoutEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
      const socket = io(`ws://${process.env.REACT_APP_ENDPOINT}:${process.env.REACT_APP_WS_PORT}`, {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${user?.accessToken}`
            }
          }
        }
      });
      if (socket) setSocket(socket)
    } else {
      history.push("/login")
    }

    EventBus.on("logout", logOut);

    return () => {
      EventBus.remove("logout", logOut);
    };
  }, [setSocket, history]);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
  };



  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <Link to={"/"} className="navbar-brand">
          Ludo
        </Link>
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to={"/lobby"} className="nav-link">
              Lobby
            </Link>

          </li>
          <li className="nav-item">
            <Player url={"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} />
          </li>

        </div>

        {currentUser ? (
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to={"/profile"} className="nav-link">
                {currentUser.username}
              </Link>
            </li>
            <li className="nav-item">
              <a href="/login" className="nav-link" onClick={logOut}>
                LogOut
              </a>
            </li>
          </div>
        ) : (
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to={"/login"} className="nav-link">
                Login
              </Link>
            </li>

            <li className="nav-item">
              <Link to={"/register"} className="nav-link">
                Sign Up
              </Link>
            </li>
          </div>
        )}
      </nav>

      <div className="container mt-3 mx-3">
        <UserContext.Provider value={currentUser} >
          <SocketContext.Provider value={socket} >

            {currentUser ? (
              <Switch>
                <Route exact path={["/", "/lobby"]} component={Lobby} />
                <Route exact path="/game/:id" component={Game} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/profile" component={Profile} />
              </Switch>
            ) : (
              <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
              </Switch>

            )}



          </SocketContext.Provider>
        </UserContext.Provider>
      </div>
    </div>
  );
};

export default App;
