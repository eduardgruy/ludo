import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';

import { Game } from './interface/game.interface';
import { Session } from './interface/session.interface';
import { INITIAL_POSITIONS, OFFSET, ORDER } from './constants';


@Injectable()
export class GameService {
    constructor(
        @Inject('GAME_MODEL')
        private gameModel: Model<Game>,
        @Inject('SESSION_MODEL')
        private sessionModel: Model<Session>,
    ) { }

    async createGame(socketId: string, gameName: string): Promise<Game> {
        const session = await this.getSession(socketId)
        if (session && gameName) {
            return this.gameModel.create({
                status: "open",
                name: gameName,
                owner: session._id,
                players: [{ username: session._id }],
                turn: "green",
                action: "roll",
                event: "Game is created!",
                positions: INITIAL_POSITIONS
            })
        }

    }

    async findAll(): Promise<Array<Game>> {
        return this.gameModel.find()
    }

    async joinGame(socketId: string, gameId: string): Promise<Game> {
        const session = await this.getSession(socketId)
        return this.gameModel.findByIdAndUpdate(gameId, { $push: { players: { username: session._id } }, $set: { event: `User ${session._id} joined the game` } }, { new: true })
    }

    async leaveGame(socketId: string, gameId: string): Promise<Game> {
        const session = await this.getSession(socketId)
        return this.gameModel.findByIdAndUpdate(gameId, { $pull: { players: { username: session._id } }, $set: { event: `User ${session._id} left the game` } }, { new: true })
    }
    async getOpenGames(): Promise<Game[]> {
        return this.gameModel.find({ status: "open" })
    }

    async getCurrentGame(username: string): Promise<Game> {
        return this.gameModel.findOne({ "players.username": username, status: { "$ne": "finished" } })
    }

    async deleteGame(socketId: string, gameId: string): Promise<Game> {
        const session = await this.getSession(socketId)
        return this.gameModel.findOneAndDelete({ _id: gameId, owner: session._id })
    }

    async createSession(id: string, username: string): Promise<Session> {
        return this.sessionModel.findByIdAndUpdate(username, { $set: { socket: id } }, { upsert: true, new: true })
    }
    async removeSession(id: string): Promise<Session> {
        return this.sessionModel.findByIdAndDelete(id)
    }

    private async getSession(socketId: string): Promise<Session> {
        return this.sessionModel.findOne({ socket: socketId })

    }

    private async getGame(gameId: string): Promise<Game> {
        return this.gameModel.findById(gameId)

    }

    async getGameDetails(socketId: string, gameId: string): Promise<Game> {
        const session = await this.getSession(socketId)
        const game = await this.gameModel.findById(gameId)


        if (!game) {
            console.log("game doesn't exist")
            return
        }

        if (game?.players.find(player => player.username == session?._id)) {
            return game
        }
        else {
            console.log("this player is not in this game")
        }
    }

    async startGame(socketId: string, gameId: string): Promise<Game> {
        const session = await this.getSession(socketId)
        const randomizeColors = () => {
            let colors = ["green", "yellow", "blue", "red"]
            colors.sort(() => Math.random() - 0.5)
            return colors
        }

        const game = await this.getGame(gameId)
        if (game.players.length !== 4 || game.owner !== session._id) {
            console.log("No enough players or you are not an owner")
            return
        }
        const colors = randomizeColors()

        game.players = colors.map((color, i) => {
            let player = game.players[i]
            player.color = color
            return player
        })
        game.status = "running"
        game.action = "roll"


        return game.save()

    }

    async roll(socketId: string, gameId: string): Promise<Game> {
        const rolled = Math.floor(Math.random() * 6) + 1
        const game = await this.getGame(gameId)
        const session = await this.getSession(socketId)

        type Pawn = {
            name: string,
            position: string
        }

        const isBlocked = (pawn: Pawn): boolean => {
            const futurePosition = this.getNextPosition(playerColor, pawn.position, rolled)

            if (futurePosition.substring(0, 1) === "h" && Number(futurePosition.substring(2)) > 4) return true

            if (game.positions[playerColor].find((pawn: Pawn) => pawn.position === futurePosition)) return true
            else return false


        }
        const stuckAtStart = (pawn: Pawn): boolean => {
            if ((["g", "y", "b", "r"].indexOf(pawn.position.substring(0, 1)) >= 0) && rolled !== 6) {
                console.log("stuck at start", pawn)
                return true
            }

            else {
                console.log(pawn, rolled)
                return false
            }
        }
        const pawnAtStart = (pawn: Pawn, playerColor): boolean => {
            const pawnAtStart = (game.positions[playerColor].find((pawn: Pawn) => {
                pawn.position === "n" + OFFSET[playerColor]

            }))
            if (pawnAtStart && pawnAtStart.name !== pawn.name) {
                return true
            } else return false

        }

        const playerColor = game.players.find(player => player.username == session._id).color
        if (playerColor !== game.turn) {
            console.log("It's not your turn!")
            return
        }
        const movable = game.positions[playerColor].filter((pawn: Pawn) => {
            if (pawnAtStart(pawn, playerColor)
                || isBlocked(pawn)
                || stuckAtStart(pawn)) return false
            return true
        }).map((pawn: Pawn) => pawn.name)
        console.log(movable)

    
        if (movable?.length >= 1) {
            game.lastRoll = rolled
            game.movable = movable
            game.action = "move"
            game.event = `${session._id} rolled ${rolled} and he can move figures on ${movable}`
        } else {
            game.lastRoll = null
            game.action = "roll"
            game.turn = ORDER[(ORDER.indexOf(game.turn) == 3) ? 0 : ORDER.indexOf(game.turn) + 1]
            game.event = `${session._id} rolled ${rolled} and he can't move any figures. ${game.turn} is rolling`
        }


        return game.save()


    }

    async move(socketId: string, gameId: string, tileName: string): Promise<Game> {
        const game = await this.getGame(gameId)
        const session = await this.getSession(socketId)
        const playerColor = game.players.find(player => player.username == session._id).color
        if (playerColor !== game.turn) {
            console.log("It's not your turn!")
            return
        }


        const pawnToMove = game.positions[playerColor].find((pawn) => pawn.position === tileName)

        if (game.movable.indexOf(pawnToMove.name) === -1) {
            console.log(`${tileName} is not movable`)

        }

        const isLeavingStart = pawnToMove
            .position
            .substring(0, 1) === playerColor.substring(0, 1) ? true : false

        let pawnOldPosition
        let pawnNewPosition
        game.positions[playerColor] = game.positions[playerColor].map((pawn) => {
            if (pawn.name == pawnToMove.name) {
                pawnOldPosition = pawn.position

                pawnNewPosition = this.getNextPosition(playerColor, pawn.position, game.lastRoll)

                pawn.position = pawnNewPosition
            }
            return pawn
        })

        const colors = ["green", "yellow", "blue", "red"]
        colors.map((color) => {
            if (color === playerColor) return

            const pawnToReturn = game.positions[color].findIndex(pawn => pawn.position === pawnNewPosition)
            if (pawnToReturn >= 0) {
                game.positions[color][pawnToReturn].position = color.substring(0, 1) + game.positions[color][pawnToReturn].name.substring(1)
            }
        });
        if (isLeavingStart) {
            game.movable = []
            game.action = "roll"
            game.event = `${session._id} rolled 6 and will roll again`
        } else if (game.lastRoll == 6 && !isLeavingStart && !game.doubleRoll) {
            game.movable = []
            game.action = "roll"
            game.doubleRoll = true
            game.event = `${session._id} rolled 6 and will roll again`

        } else {
            game.movable = []
            game.lastRoll = null
            game.action = "roll"
            game.doubleRoll = false
            game.turn = ORDER[(ORDER.indexOf(game.turn) == 3) ? 0 : ORDER.indexOf(game.turn) + 1]
            game.event = `${session._id} moved, ${game.turn} is next and will roll again`
        }



        return game.save()
    }

    private getNextPosition(playerColor: string, pawnPosition: any, rolled: number): string {
        if (["g", "y", "b", "r"].indexOf(pawnPosition.substring(0, 1)) >= 0) {
            // if on start, go to offset
            return "n" + String(OFFSET[playerColor] + 1)
        } else if (pawnPosition.substring(0, 1) == "h") {
            //if is at home but moves too far, consider him blocked
            // else move him further home
            return pawnPosition.substring(0, 2) + String(Number(pawnPosition.substring(2)) + rolled)
        } else {
            // if he would pass home, move him to home squares instead
            if (Number(pawnPosition.substring(1)) <= OFFSET[playerColor] &&
                Number(pawnPosition.substring(1)) + rolled
                > (OFFSET[playerColor] == 0 ? 52 : OFFSET[playerColor])) {
                return "h"
                    + playerColor.substring(0, 1)
                    + String(
                        (Number(pawnPosition.substring(1)) + rolled)
                        - (OFFSET[playerColor] == 0 ? 52 : OFFSET[playerColor]))
            } else {
                return Number(pawnPosition.substring(1)) + rolled <= 52 ?
                    "n" + String(Number(pawnPosition.substring(1)) + rolled) :
                    "n" + String(Number(pawnPosition.substring(1)) + rolled - 52)
            }
        }
    }

}
