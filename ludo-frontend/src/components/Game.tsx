import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";

import Chat from "./Chat"
import Board from "./Board/Board";
import Die from "./Board/Die"
import { GameI } from "../types/game.type";
import { SocketContext } from "../context/socket";
import { useHistory } from "react-router-dom"
import { UserContext } from "../context/user"
import { userInfo } from "os";



type GameParams = {
    id: string;
};


const Game: React.FC = () => {
    const socket = useContext(SocketContext)
    const { id } = useParams<GameParams>()
    const [notReady, setNotReady] = useState<boolean>(true)
    const [starting, setStarting] = useState<boolean>(false)
    const [userColor, setUserColor] = useState<string>("")
    const [myTurn, setMyTurn] = useState<boolean>(false)
    const [deleting, setDeleting] = useState<boolean>(false)
    const [leaving, setLeaving] = useState<boolean>(false)
    const [game, setGame] = useState<GameI>();
    const [chat, setChat] = useState<Array<Message>>([])

    const history = useHistory()
    const user = useContext(UserContext)

    type Message = {
        sender: string,
        content: string
    }

    const handleUpdateGame = useCallback((game: GameI) => {


        if (!userColor) {
            setUserColor(userColor => {
                const color = game.players.find((player) => player.username === user.username)?.color
                return color ? color : userColor
            })
        }

        if (game) {
            console.log(game)
            setMyTurn(game.turn === game.players.find((player) => player.username === user.username)?.color ? true : false)
            setGame(game)
            setChat(chat => [...chat, { sender: "system", content: game.event }])
            if (game.players.length === 4) setNotReady(false)
        }

    }, []);
    const handleRemovedGame = useCallback((gameId: string) => {
        history.push("/lobby")

    }, [history]);
    const handleLeaveGame = useCallback(() => {
        history.push("/lobby")
    }, [history]);
    const handleNewMessage = useCallback((message: Message) => {
        setChat(chat => [...chat, { sender: message.sender, content: message.content }])
    }, [setChat]);



    useEffect(() => {
        if (socket) {
            socket.emit("get-game", { gameId: id })

            socket.on('game', (game) => handleUpdateGame(game))
            socket.on('chat', (message: Message) => handleNewMessage(message))
            socket.on('removed-your-game', (gameId) => handleRemovedGame(gameId))

            socket.on('left-game', () => handleLeaveGame())
        }


        // socket.on('updated-game', (game) => handleUpdatedGame(game))
        // socket.on('joined-game', (gameId) => handleJoinedGame(gameId))

        return () => {
            // before the component is destroyed
            // unbind all event handlers used in this component
            socket.off('game', (game) => handleUpdateGame(game))
            socket.off('removed-your-game', (gameId) => handleRemovedGame(gameId))
            socket.off('left-game', () => handleLeaveGame())

            // socket.off('new-game', (games) => handleAddGame(games))
            // socket.off('updated-game', (game) => handleUpdatedGame(game))
            // socket.off('joined-game', (game) => handleJoinedGame(game))

        }
    }, [handleUpdateGame, handleRemovedGame, handleLeaveGame, socket, id]);

    const startGame = () => {
        console.log("starting game")
        setStarting(true)
        socket.emit("start-game", { gameId: id })
    }

    const deleteRoom = () => {
        setDeleting(true)
        socket.emit("delete-game", { gameId: id })
    }
    const leaveRoom = () => {
        setLeaving(true)
        socket.emit("leave-game", { gameId: id })
    }
    const roll = () => {
        if (myTurn && game?.action === "roll") {
            socket.emit("roll", { gameId: id })
        }
    }
    const move = (tileName: string) => {
        if (myTurn && game?.action === "move") {
            socket.emit("move", { gameId: id, tileName: tileName })
        }
    }
    const sendMessage = (message: Message) => {
        socket.emit("chat", { sender: message.sender, content: message.content })
    }


    if (game?.status === "open") {
        return (
            <div className="container" >
                <div className="chat">
                    <Chat sendMessage={sendMessage} messages={chat} />
                </div>
                <div className="card">
                    <p>Room name: {game.name}</p>
                    <p>Players: {game.players.length}/4</p>
                    {game.players.map(player => (<p>{player.username}</p>))}
                    {game.owner === user.username ? (
                        <div>
                            <button className="btn btn-primary btn-block" disabled={notReady} onClick={startGame}>Start Game</button>
                            <button className="btn btn-secondary btn-block" disabled={deleting} onClick={deleteRoom}>Delete</button>
                        </div>) :
                        <button className="btn btn-secondary btn-block" disabled={leaving} onClick={leaveRoom}>Leave</button>

                    }
                </div >
            </div >

        )
    } else if (game?.status === "running") {
        return (
            < div className="game" >
                <div className="chat-container">
                    <Chat sendMessage={sendMessage} messages={chat} />
                </div >
                <div className="board-container">
                    <Board positions={game.positions} movable={game.movable} myTurn={myTurn} move={move} />
                </div>
                <div className="controls-container">
                    <p>{user.username} you are {game.players.find((player) => player.username === user.username)?.color}</p>
                    <p>It's {game.turn} turn and action is {game.action}</p>
                    <Die rolled={game.lastRoll} myTurn={myTurn} action={game.action} roll={roll} />
                </div>
            </div >

        )

    } else {

        return (
            <div>
                <span>Your Game is loading</span>
                <span className="spinner-border spinner-border-l" ></span>
            </div>
        )

    }


}

export default Game;
