import React from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';

type Props = {
    className: string,
    data: string[],
    width: number,
    height?: number,
    cellHeight: number,
    cellColor?: string,
    color?: string,
    selectedItem?: string,
    selectedItems?: string[],
    keys: string[], /** ID of cell */
    clickHandler: (country: string | undefined) => void
}
/**
 * props.data string[]------> str1:::str2:::str3  ::: is separator.
 */
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const ListColumn: React.FC<Props> = (props) => {
    const bgColor = (list: string[], target: string) => {
        //console.log("bgColor", list, target);
        const index = list.findIndex(item => item === target);
        //console.log("bgColor=========", index, colorScale(index + ""))
        return colorScale(index + "");
    };
    const contents = props.data.map(item => {
        return item ? item.split(":::") : ["", ""]
    });
    const setColor = (multiSelect: boolean, singleSelect: boolean, id: string) => {
        if (multiSelect && !singleSelect) {
            //console.log("DOUBLE");
            const items = props.selectedItems || [];
            return items.find(item => item === id) ? bgColor(items, id) : "#333";
        } else if (!multiSelect && singleSelect) {
            //console.log("SINGLE");
            const item = props.selectedItem || "";
            return item === id ? "tomato" : "#333"
        } else {
            return "#333"
        }
    };
    return (
        <ul className={props.className}>
            {contents.map((item, index) => (<li onClick={(e) => { props.clickHandler((e.target as HTMLElement).dataset.name) }} data-name={props.keys[index]} style={{ background: setColor(props.selectedItems ? true : false, props.selectedItem ? true : false, props.keys[index]) /*props.keys[index] === props.selectedItem ? "red" : "#333"*/ }} key={index}>
                <span data-name={props.keys[index]} onClick={(e) => { props.clickHandler((e.target as HTMLElement).dataset.name) }}>{item[0]}</span>
                <span data-name={props.keys[index]} onClick={(e) => { props.clickHandler((e.target as HTMLElement).dataset.name) }}>{item[1]}</span>
            </li>))}
        </ul>
    )
};

export default styled(ListColumn)`
    position:relative;
    width:${props => props.width + "px"};
    height: ${props => props.height ? props.height + "px" : "auto"};
    list-style:none;
    background:white;
    padding:0;
    margin:0;
    overflow:scroll;
    li{
        margin:0;
        padding:1rem;
        box-sizing:border-box;
        height:${props => props.cellHeight + "px"};
        border:1px solid #ccc;
        background:${props => props.cellColor ? props.cellColor : "white"};
        text-align:left;
        color:${props => props.color ? props.color : "white"};
        font-size:1rem;
        font-weight:bold;
        display:flex;
        justify-content:space-between;
    }
    li>span{
        -webkit-user-select:none
    }
`;
