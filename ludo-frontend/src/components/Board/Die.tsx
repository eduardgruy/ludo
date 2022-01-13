import React from "react";

type Props = {
    myTurn: boolean
    action: string
    roll: any
    rolled: number
}


const Die = (props: Props) => {
    // let pips = Number.isInteger(props.value)
    //     ? Array(props.value)
    //         .fill(0)
    //         .map((_, i) => <Pip key={i} />)
    //     : null;
    return (<div className={'face ' + (props.myTurn && props.action === "roll" ? 'glow' : '')}
        style={{ cursor: props.myTurn ? 'pointer' : undefined }}
        onClick={() => { props.roll() }}>
        {props.rolled ? [...Array(props.rolled)].map((_, i) => {
            return <span className="pip" />;
        }) : <span className="pip" />}

    </div>);
};

export default Die