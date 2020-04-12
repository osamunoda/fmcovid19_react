import React from 'react';
import styled from 'styled-components';

type Props = {
    className: string,
    show: boolean,
    _width: number,
    _height: number,
    _top?: number
}

const SidePanel: React.FC<Props> = (props) => {
    return (
        <div className={props.className} style={{ left: props.show ? 0 : props._width * -1 - 2 + "px" }}>
            {props.children}
        </div>
    )
}

export default styled(SidePanel)`
    background-color: white;
    box-sizing:border-box;
    border:1px solid black;
    position:absolute;
    transition: 0.4s left;
    width:${props => props._width + "px"};
    height:${props => props._height + "px"};
    top:${props => props._top ? props._top + "px" : 0}
`;