import { Positions } from "./interface/game.interface"
const INITIAL_POSITIONS: Positions = {
            green: [{ name: "g1", position: "g1" }, { name: "g2", position: "g2" }, { name: "g3", position: "g3" }, { name: "g4", position: "g4" }],
            yellow: [{ name: "y1", position: "y1" }, { name: "y2", position: "y2" }, { name: "y3", position: "y3" }, { name: "y4", position: "y4" }],
            blue: [{ name: "b1", position: "b1" }, { name: "b2", position: "b2" }, { name: "b3", position: "b3" }, { name: "b4", position: "b4" }],
            red: [{ name: "r1", position: "r1" }, { name: "r2", position: "r2" }, { name: "r3", position: "r3" }, { name: "r4", position: "r4" }],
        }

const NEUTRAL_TILES = 52

const OFFSET = {
    green: 0,
    yellow: 13,
    blue: 26,
    red: 39
}

const ORDER = ["green", "yellow", "blue", "red"]

export { INITIAL_POSITIONS, NEUTRAL_TILES, OFFSET, ORDER }