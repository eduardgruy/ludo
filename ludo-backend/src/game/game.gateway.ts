import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  ConnectedSocket,
  OnGatewayConnection

} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { Public } from '../auth/jwt-auth.guard';


@Public()
@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  }
})
export class GameGateway {
  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
    private readonly userService: UsersService) { }


  async handleConnection(socket: Socket) {
    if (!socket.handshake.headers.authorization) {
      console.log("No Auth header provided")
      socket.disconnect()
      return
    }

    const payload: any = await this.authService.verify(
      socket.handshake.headers.authorization.split(' ')[1],
    );

    const user = payload ? await this.userService.findOne(payload.username) : null;

    if (!user) {
      console.log("No user found")
      socket.disconnect()
      return;
    }

    this.gameService.createSession(socket.id, payload.username)
      .then(session => {
        this.gameService.getCurrentGame(session._id)
          .then(game => {
            if (game) {
              console.log("joining to game" + game._id)
              socket.join(String(game._id))
              socket.emit("game", game)
            }
          })
      })

    console.log(`User ${payload.username} connected: socket ${socket.id}  `)
    this.server.emit('global-chat', "Player has joined lobby")

  }

  async handleDisconnect(socket: Socket) {
    this.gameService.removeSession(socket.id)
    console.log(`User disconnected: socket ${socket.id}  `)
    socket.rooms.forEach(gameId => {
      // add gracefull game closing
      // this.gameService.end(gameId)
      this.server.sockets.in(gameId).disconnectSockets()
    })
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create-game')
  async createGame(@MessageBody('gameName') gameName: string,
    @ConnectedSocket() socket: Socket) {
    this.gameService.createGame(socket.id, gameName)
      .then(game => {
        socket.join(String(game._id))
        socket.emit("joined-game", game._id)
        this.server.in(String(game._id)).emit("game-created")
        this.server.in(String(game._id)).emit("user-joined")
        this.server.emit('new-game', game)
      })
  }
  @SubscribeMessage('get-games')
  async getGames(
    @ConnectedSocket() socket: Socket) {
    this.gameService.getOpenGames()
      .then(games => {
        socket.emit("games", games)
      })
  }

  @SubscribeMessage('get-game')
  async getGame(@MessageBody('gameId') gameId: string,
    @ConnectedSocket() socket: Socket) {
    this.gameService.getGameDetails(socket.id, gameId)
      .then(game => {
        socket.emit("game", game)
      })
  }



  @SubscribeMessage('join-game')
  async joinGame(@MessageBody('gameId') gameId: string,
    @ConnectedSocket() socket: Socket) {
    this.gameService.joinGame(socket.id, gameId)
      .then(async game => {
        // join user to room give user game id to join
        socket.join(String(game._id))
        socket.emit("joined-game", game._id)
        // update game for users already joined
        this.server.sockets.in(String(game._id)).emit("game", game)
        //update game in lobby
        socket.emit("updated-game", game)


      })
  }
  @SubscribeMessage('leave-game')
  async leaveGame(@MessageBody('gameId') gameId: string,
    @ConnectedSocket() socket: Socket) {
    this.gameService.leaveGame(socket.id, gameId)
      .then(async game => {
        if (game) {
          // leave user to room give user game id to join
          socket.leave(String(game._id))
          socket.emit("left-game") //tell him that he left
          // update game for users already joined
          this.server.sockets.in(String(game._id)).emit("game", game)
          //update game in lobby
          socket.emit("updated-game", game)
        }



      })
  }



  @SubscribeMessage('start-game')
  async startGame(@MessageBody('gameId') gameId: string,
    @ConnectedSocket() socket: Socket) {

    this.gameService.startGame(socket.id, gameId)
      .then(game => {
        if (game) {
          this.server.in(String(game._id)).emit("game", game)
          this.server.emit("game-removed", game._id)
        }
      }
      )
  }

  @SubscribeMessage('delete-game')
  async deleteGame(@MessageBody('gameId') gameId: string,
    @ConnectedSocket() socket: Socket) {
    this.gameService.deleteGame(socket.id, gameId).
      then(game => {
        if (game) {
          console.log(this.server.in(String(game._id)).allSockets())
          this.server.in(String(game._id)).emit("removed-your-game", game._id)
          this.server.sockets.socketsLeave(String(game._id))
          this.server.emit("removed-game", game._id)
        }

      })
  }

  @SubscribeMessage('roll')
  async roll(@MessageBody('gameId') gameId: string,
    @ConnectedSocket() socket: Socket) {
    this.gameService.roll(socket.id, gameId)
      .then(game => {
        this.server.in(String(game._id)).emit('game', game)
      })
  }
  @SubscribeMessage('chat')
  async chat(@MessageBody('gameId') gameId: string,
    @MessageBody('message') message: string) {
    this.server.in(String(gameId)).emit('chat', message)
  }

  @SubscribeMessage('move')
  async move(@MessageBody('gameId') gameId: string,
    @MessageBody('tileName') tileName: string,
    @ConnectedSocket() socket: Socket) {
    //todo
    this.gameService.move(socket.id, gameId, tileName)
      .then(game => {
        this.server.in(String(game._id)).emit('game', game)
      })

    // this.server.in(gameId).emit("player-move", game)

  }

}