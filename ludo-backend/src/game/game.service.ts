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

        //TODO: Check if it's users turn

        const isBlocked = (pawn): boolean => {
            const futurePosition = this.getNextPosition(playerColor, pawn.position, rolled)

            if (Number(pawn.position.substring(1)) + rolled > 6) return true

            if (futurePosition != "h5" && game.positions[playerColor].find(pawn => pawn.position == futurePosition)) return true
            else return false


        }
        const stuckAtStart = (pawn): boolean => {
            if (pawn.position.substring(1) == "s" && rolled != 6) return true
            else return false
        }


        const playerColor = game.players.find(player => player.username == session._id).color
        if (playerColor !== game.turn) {
            console.log("It's not your turn!")
            return
        }
        const movable = game.positions[playerColor].map(pawn => {
            if (isBlocked(pawn)
                || stuckAtStart(pawn)) return
            return pawn.name
        })

        if (movable) {
            game.lastRoll = rolled
            game.movable = movable
            game.action = "move"
        } else {
            game.lastRoll = null
            game.action = "roll"
            game.turn = ORDER[(ORDER.indexOf(game.turn) == 3) ? 0 : ORDER.indexOf(game.turn) + 1]
        }


        return game.save()


    }

    async move(socketId: string, gameId: string, pawnToMove: string): Promise<Game> {
        const game = await this.getGame(gameId)
        const session = await this.getSession(socketId)
        const playerColor = game.players.find(player => player.username == session._id).color
        if (playerColor !== game.turn) {
            console.log("It's not your turn!")
            return
        }

        if (!game.movable.find(pawn => pawn == pawnToMove)) {
            console.log(`${pawnToMove} is not movable`)
        }
        const isLeavingStart = game
            .positions[playerColor]
            .find((pawn) => pawn.name == pawnToMove)
            .position
            .substring(0, 1) != "s" ? true : false

        let pawnOldPosition
        let pawnNewPosition
        game.positions[playerColor] = game.positions[playerColor].map((pawn) => {
            if (pawn.name == pawnToMove) {
                pawnOldPosition = pawn.position

                pawnNewPosition = this.getNextPosition(playerColor, pawn.position, game.lastRoll)

                pawn.position = pawnNewPosition

            }
        })

        Object.entries(game.positions)
            .map(([color, positions]) => {
                if (color == playerColor) return positions
                const pawnToReturn = positions.findIndex(pawn => pawn.position = pawnNewPosition)
                if (pawnToReturn) {
                    game.positions[color][pawnToReturn].position = "h" + positions[pawnToReturn].name.substring(1)
                }
            });

        if (game.lastRoll == 6 && !isLeavingStart && !game.doubleRoll) {
            game.action = "roll"
            game.doubleRoll = true

        } else {
            game.lastRoll = null
            game.action = "roll"
            game.turn = ORDER[(ORDER.indexOf(game.turn) == 3) ? 0 : ORDER.indexOf(game.turn) + 1]

        }



        return game.save()
    }

    private getNextPosition(playerColor: string, pawnPosition: any, rolled: number): string {
        if (pawnPosition.substring(0, 1) == "s") {
            // if on start, go to offset
            return "n" + String(OFFSET[playerColor])
        } else if (pawnPosition.substring(0, 1) == "h") {
            //if is at home but moves too far, consider him blocked
            // else move him further home
            return "h" + String(Number(pawnPosition.substring(1)) + rolled)
        } else {
            // if he would pass home, move him to home squares instead
            if (Number(pawnPosition.substring(1)) + rolled
                > (OFFSET[playerColor] == 0 ? 53 : OFFSET[playerColor] - 2)) {
                return "h"
                    + String(
                        (Number(pawnPosition.substring(1)) + rolled)
                        - (OFFSET[playerColor] == 0 ? 53 : OFFSET[playerColor] - 2))
            } else {
                return "n" + String(Number(pawnPosition.substring(1)) + rolled)
            }
        }
    }

}
