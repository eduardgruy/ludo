
interface Props {
    colors: string,
    movable: boolean
}

export default function Goti(props: Props) {
    const colors: Record<string, string> = {
        green: '#66bb6a',
        yellow: '#fff176',
        blue: '#29b6f6',
        red: '#e53935'
    };

    return (
        <span>

            <div
                className={'egg-bottom ' + (props.movable ? 'glow' : '')}
                style={{ background: 'radial-gradient(circle at 33% 33%, ' + colors[props.colors] + ', #000)', height: "60%", width: "70%", }}>
                <div className={'egg-top ' + (props.movable ? 'glow' : '')}
                    style={{ background: 'radial-gradient(circle at 33% 33%, ' + colors[props.colors] + ', #000)', height: "60%", width: "70%", }}>

                </div>
            </div>

        </span>)
}