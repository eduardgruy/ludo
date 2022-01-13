import React, { useState, useEffect, useContext, useCallback } from "react";

import { SocketContext } from "../context/socket";
import { getCurrentUser } from "../services/auth.service";
import { GameI } from "../types/game.type"


const Profile: React.FC = () => {
  const socket = useContext(SocketContext)

  const currentUser = getCurrentUser();
  const [finishedGames, setFinishedGames] = useState<GameI[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const handleFinishedGames = useCallback((games: Array<GameI>) => {
    setLoading(false)
    console.log(games)
    if (games) {
      setFinishedGames([...games])
    }
  }, []);

  useEffect(() => {
    socket.emit("get-finished-games")

    socket.on("finished-games", (games: GameI[]) => handleFinishedGames(games))


    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off('finished-games', (games: GameI[]) => handleFinishedGames(games))

    }
  }, [handleFinishedGames, socket]);

  if (loading) {

    return (
      <div>
        <span>Your Game is loading</span>
        <span className="spinner-border spinner-border-l" ></span>
      </div>
    )


  } else {
    return (
      <div>
        <div className="container">
          <header>
            <h3>
              <strong>{currentUser.username}</strong>
            </h3>
            <h3>
              <strong>winrate: { finishedGames ? finishedGames?.filter(game => game.winner === currentUser.username).length / finishedGames?.length * 100 : "You haven't played any game yet" }%</strong>
            </h3>
          </header>
        </div>
        {!finishedGames ? <p>You haven't played any games yet</p> : finishedGames.map(game => {
          return (
            <li className="card card-container" key={game._id}>
              <p>Name: {game.name}</p>
              <p><span role="img" aria-label="crown">🤴</span>Winner: {game.winner}</p>
              <p>Players:</p>
              {game.players.map(player => (<p key={player.username}><span role="img" aria-label="fireworks">🙋‍♂️</span>{player.username}</p>))}
            </li>
          )
        })}
      </div>
    );
  }
};

export default Profile;
