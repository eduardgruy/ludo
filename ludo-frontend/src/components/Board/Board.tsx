import React, { useEffect, useState } from 'react';
import Goti from './Goti';
import { Positions } from '../../types/game.type'
import { tiles } from './constants'
import { array } from 'yup/lib/locale';

interface Props {
	positions: Positions
	movable: Array<string>
	myTurn: boolean
	move(tileName: string): void,
}


export default function Board(props: Props) {

	const [activeGotis, setActiveGotis] = useState<any>({})

	useEffect(() => {
		if (props.positions) {
			setActiveGotis(() => Object.entries(props.positions).reduce((acc, [color, gotis]) => {
				if (typeof gotis === 'string') return { ...acc }
				const newGotis = gotis.reduce((prev: any, goti: any) => {

					return { ...prev, [goti.position]: { color: color, movable: props.movable.find(name => goti.name === name) ? true : false } }

				}, {})
				return { ...acc, ...newGotis }
			}, {}))
		}

	}, [props.positions, props.movable, setActiveGotis])



	return (
		<div className="board">
			{["green", "yellow", "red", "blue"].map(color => {
				const style = color === "green" ? {} : color === "yellow" ? { right: 0 } : color === "red" ? { bottom: 0 } : { bottom: 0, right: 0 }
				return (
					<div key={color} className={"house " + color} style={style}>
						<div className="box">
							{["one", "two", "three", "four"].map((number, i) => {
								const index = color.substring(0, 1) + String(i + 1)
								return (

									<div key={color + i} className={"circle square-" + number + " " + color}>
										{activeGotis[index] ? <Goti colors={color} movable={activeGotis[index].movable} myTurn={props.myTurn} tileName={color.substring(0,1)+String(i+1)} move={props.move} /> : null}
									</div>
								)
							})}
						</div>
					</div>
				)

			})}

			{tiles.map(tile => {
				return (
					<div key={tile.name} className={"cells " + tile.class} style={tile.style}>
						{activeGotis[tile.name] ? <Goti colors={activeGotis[tile.name].color} movable={activeGotis[tile.name].movable} myTurn={props.myTurn} tileName={tile.name}  move={props.move}/> : null}
					</div>
				)
			})}
		</div>
	);
}