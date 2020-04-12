import React from 'react';
import styled from 'styled-components';

type Props = {
    className: string,
    critical_point: number,
    fixed_width: number,
    height?: number,
    reverse: boolean,
    bgLeft?: string,
    bgRight?: string
}

const Section2: React.FC<Props> = (props) => {
    return (
        <section className={props.className}>
            {props.children}
        </section>
    )
}


export default styled(Section2)`
    position:relative;
    
    width:100%;
    display:flex;
    height:${props => props.height ? props.height : "auto"};
    height:${props => props.height ? props.height + "px" : "auto"};
    flex-direction:${props => props.reverse ? "row-reverse" : "row"};
    .left{
        flex:1;
        background-color:${props => props.bgLeft || "white"};
        color:white;
    }
    .right{
        width:${props => props.fixed_width + "px"};
        background:${props => props.bgRight || "white"};
        display: none
    }
    @media screen and (min-width:${props => props.critical_point + "px"}){
        .right {
            background:#333;
            display:block;
        }
    }
    
`;
