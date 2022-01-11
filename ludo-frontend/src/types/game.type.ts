export interface GameI {
    _id: string,
    status: string,
    readonly name: string,
    readonly owner: string,
    players: Players[],
    winner: string,
    positions: Positions,
    lastRoll: number,
    doubleRoll: boolean,
    turn: string,
    action: string,
    event: string,
    movable: string[]
}

export interface Positions {
    green: {
        readonly name: string
        readonly position: string
    }[]
    red: {
        readonly name: string
        readonly position: string
    }[]
    blue: {
        readonly name: string
        readonly position: string
    }[]
    yellow: {
        readonly name: string
        readonly position: string
    }[]
}

interface Players {
    username: string,
    color: string
}
