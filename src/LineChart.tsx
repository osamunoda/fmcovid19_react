import React, { useEffect } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import 'd3-selection-multi';
import { CovidData } from './util';

type Props = {
    className: string,
    data: CovidData[],
    width: number,
    height: number,
    margin: number,
    items: string[]
}
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const LineChart: React.FC<Props> = (props) => {
    // const [svgWidth, setSvgWidth] = useState(props.width);
    // const [svgHeight, setSvgHeight] = useState(props.height);
    // useEffect(()=>{
    //     setSvgWidth(props.width);
    //     setSvgHeight(props.height);
    // },[props.width, props.height]);
    useEffect(() => {
        const svg = d3.select("svg");
        const countries = props.data;

        if (!countries.length) return;
        const width = props.width, height = props.height, margin = props.margin;
        svg.style("width", width).style("height", height);
        const maxY = d3.max(countries.map(item => item.latest).concat([1000000]));
        // scale
        const scaleX = d3.scaleLinear().domain([0, countries[0].data.length]).range([margin, width - margin]);
        const scaleY = d3.scaleLog().clamp(true).domain([1, maxY || 1000000]).range([height - margin, margin]);

        //axes
        const axisX = d3.axisBottom(scaleX);
        const axisY = d3.axisLeft(scaleY).ticks(10, 0).tickSize(margin * 2 - width).ticks(5).tickFormat(d => d + "");
        //const axisY = d3.axisLeft(scaleY).ticks(10, 0).tickSize(props.margin * 2 - props.width).ticks(5).tickFormat(d => d);
        svg.selectAll("g").remove();
        svg.append("g").call(axisY).attr("transform", `translate(${margin},0)`);
        svg.append("g").call(axisX).attr("transform", `translate(0, ${height - margin})`);
        const lineData = countries.map(item => item.data);
        /** Make coordinates - array of tuple */
        const newPoints = lineData.map((line, index) => {
            const points = line.map((num, i) => {
                const tuple: [number, number] = [scaleX(i), scaleY(num)];
                return tuple;
            });
            return points;
        });
        // Draw lines
        svg.selectAll("path.line").data(newPoints).join("path").attr("class", "line").attrs({
            d: (d, i) => d3.line()(newPoints[i]),
            fill: "none",
            "stroke-width": 2,
            stroke: (d, i) => colorScale(props.items.findIndex(item => item === countries[i].name) + "")
        })
        // show country name at the end of line
        svg.selectAll("text.cname").data(countries).join("text").attr("class", "cname").attrs({
            x: (d, i) => scaleX(d.data.length),
            y: (d, i) => scaleY(d.data[d.data.length - 1]),
            stroke: "none",
            fill: (d, i) => colorScale(props.items.findIndex(item => item === d.name) + "")
        }).text(d => d.name);
    }, [props.data, props.width, props.height, props.margin, props.items]);
    return (
        <div className={props.className}>
            <svg width={props.width + "px"} height={props.height + "px"}></svg>
        </div>
    );
}

export default styled(LineChart)`
    position:relative;
    svg{
        background: #333;
        stroke:white;
    }
`;