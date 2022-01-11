import React, { useState, useEffect, useContext, useCallback } from "react";
import { SocketContext } from "../context/socket";
import { GameI } from "../types/game.type"
import { useHistory } from "react-router-dom"


const Lobby: React.FC = () => {
  const [rooms, setRooms] = useState<GameI[] | undefined>(undefined);
  const [joining, setJoining] = useState<boolean>(false);
  const [roomName, setRoomName] = useState("");

  const socket = useContext(SocketContext)
  const history = useHistory()

  const handlePopulateGames = useCallback((games: Array<GameI>) => {
    console.log("got new games", games)
    if (games) setRooms([...games])
  }, []);

  const handleAddGame = useCallback((game: GameI) => {
    console.log("new game!", game)
    setRooms(rooms => rooms ? [...rooms, game] : [game])
  }, [setRooms]);

  const handleJoinedGame = useCallback((gameId: string) => {
    history.push('/game/' + gameId)
  }, [history]);

  const handleUpdatedGame = useCallback((game: GameI) => {
    setRooms(oldRooms => {
      if (!oldRooms) return

      const index = oldRooms.findIndex(room => room._id === game._id)
      const newRooms = [...oldRooms];
      newRooms[index] = {
        ...newRooms[index],
        players: game.players
      };
      return newRooms
    })
  }, [setRooms]);

  const handleRemovedGame = useCallback((gameId: string) => {
    setRooms(oldRooms => {
      if (!oldRooms) return

      const index = oldRooms.findIndex(room => room._id === gameId)
      if (index !== -1) return [...oldRooms.slice(0, index), ...oldRooms.slice(index + 1)]
      else return oldRooms
    })
  }, [setRooms]);



  useEffect(() => {
    socket.emit("get-games")

    socket.on('games', (games: GameI[]) => handlePopulateGames(games))

    socket.on('new-game', (game: GameI) => handleAddGame(game))

    socket.on('updated-game', (game: GameI) => handleUpdatedGame(game))
    socket.on('removed-game', (gameId: string) => handleRemovedGame(gameId))
    socket.on('joined-game', (gameId: string) => handleJoinedGame(gameId))

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off("games", (games) => handlePopulateGames(games));
      socket.off('new-game', (games) => handleAddGame(games))
      socket.off('updated-game', (game) => handleUpdatedGame(game))
      socket.off('removed-game', (gameId: string) => handleRemovedGame(gameId))

      socket.off('joined-game', (game) => handleJoinedGame(game))

    }
  }, [handlePopulateGames, handleUpdatedGame, handleAddGame, handleJoinedGame, handleRemovedGame, socket]);

  const handleJoin = (gameId: string) => {
    setJoining(true)
    socket.emit("join-game", { gameId: gameId })
  }

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredName = event.target.value;
    setRoomName(enteredName);
  };

  const createRoom = () => {
    if (roomName) {
      console.log("Creating room " + roomName)
      socket.emit("create-game", { gameName: roomName })
    }

  };
  return (
    <div className="container">
      <div className="container-sm">
        <input value={roomName}
          onChange={handleInput} placeholder="Enter name" />
        <button className="btn btn-primary btn-block" disabled={joining} onClick={createRoom}>Create Room</button></div>
      {!rooms ? <p>no active rooms atm</p> : rooms.map(room => {
        return (
          <li className="card card-container" key={room._id}>
            <p>Name: {room.name}</p>
            <p>Players: {room.players.length}/4</p>
            <button type="submit" className="btn btn-primary btn-block" disabled={joining} onClick={() => handleJoin(room._id)} >
              {joining && (
                <span className="spinner-border spinner-border-sm"></span>
              )}
              <span>Join</span>
            </button>
          </li>
        )
      })
      }
    </div>
  );
};

export default Lobby;
