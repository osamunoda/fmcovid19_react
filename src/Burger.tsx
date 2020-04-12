import React, { useState } from 'react';
import styled from 'styled-components';

type Props = {
    className: string,
    show: boolean,
    size: number,
    checked: boolean,
    color: string,
    clickHandler: () => void,
    //critical_point?: number
};

const Burger: React.FC<Props> = (props: Props) => {
    const [checked, setChecked] = useState(props.checked);
    //const [show, setShow] = useState(props.show);
    const spaceUnit = (props.size - 2) / 7;
    const bar1transform = "translateY(" + spaceUnit * 2 + "px) rotate(45deg)";
    const bar2transform = "translateY(-" + spaceUnit * 2 + "px) rotate(-45deg)";


    // useEffect(() => {
    //     window.onresize = () => {
    //         setShow(props.show);
    //     }
    // }, [props.show]);

    return (
        <div className={props.className} style={{ display: props.show ? "flex" : "none" }} onClick={() => { props.clickHandler(); setChecked(!checked) }}>
            <div className="bar" style={{ transform: checked ? bar1transform : "none" }}></div>
            <div className="bar" style={{ opacity: checked ? 0 : 1 }}></div>
            <div className="bar" style={{ transform: checked ? bar2transform : "none" }}></div>
        </div>
    )
};

export default styled(Burger)`
    color:${props => props.color};
    width:${props => props.size + "px"};
    height:${props => props.size + "px"};
    box-sizing: border-box;
    justify-content:space-evenly;
    align-items:center;
    flex-direction:column;
    border:1px solid ${props => props.color};
    position:relative;
    border-radius:4px;
    .bar{
        background-color:${props => props.color};
        width: 80%;
        height:${props => props.size / 7 + "px"};
        border-radius:2px;
    }
`;