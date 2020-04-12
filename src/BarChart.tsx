import React, { useEffect } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import 'd3-selection-multi';
import { CovidData, getMaxLineValue } from './util';

type Props = {
    className: string,
    data: CovidData,
    width: number,
    height: number,
    margin: number,
    item: string,
    barColor: string,
    axisType: string
}

const BarChart: React.FC<Props> = (props) => {
    // const [svgWidth, setSvgWidth] = useState(props.width);
    // const [svgHeight, setSvgHeight] = useState(props.height);
    // useEffect(()=>{
    //     setSvgWidth(props.width);
    //     setSvgHeight(props.height);
    // },[props.width, props.height]);
    useEffect(() => {
        if (!props.data.name) return;
        const country = props.data;
        const width = props.width, height = props.height, margin = props.margin;
        const cases_day = country.data.map((item, index, arr) => index === 0 ? item : (arr[index] - arr[index - 1]));
        const bar_width = (width - margin * 2) / cases_day.length;
        const svg = d3.select("#barchart_svg");
        svg.style("width", width).style("height", height);
        const maxY = props.axisType === "logarithmic" ? 100000 : getMaxLineValue(d3.max(cases_day) || 100000);
        // scale
        const scaleX = d3.scaleLinear().domain([0, cases_day.length]).range([margin, width - margin]);
        const scaleY = props.axisType === "logarithmic" ? d3.scaleLog().clamp(true).domain([1, maxY]).range([height - margin, margin]) : d3.scaleLinear().domain([0, maxY]).range([height - margin, margin]);
        //axes
        const axisX = d3.axisBottom(scaleX);
        const axisY = d3.axisLeft(scaleY).ticks(10, 0).tickSize(margin * 2 - width).ticks(5).tickFormat(d => d + "");
        svg.selectAll("g").remove();
        svg.append("g").call(axisY).attr("transform", `translate(${margin},0)`);
        svg.append("g").call(axisX).attr("transform", `translate(0, ${height - margin})`);
        // Data filtering
        svg.selectAll("rect").data(cases_day).join("rect").attrs({
            stroke: "#333",
            fill: (d, i) => props.barColor,
            x: (d, i) => (scaleY(0) - scaleY(d)) > 0 ? scaleX(i) : 0,
            y: d => scaleY(d),
            width: bar_width,
            height: d => Math.abs(scaleY(0) - scaleY(d))
        });
    }, [props.data, props.width, props.height, props.margin, props.item, props.barColor, props.axisType]);
    return (
        <div className={props.className}>
            <svg id="barchart_svg" width={props.width + "px"} height={props.height + "px"}></svg>
        </div>
    );
}

export default styled(BarChart)`
    position:relative;
    svg{
        background: #333;
        fill:white;
        stroke:none;
    }
`;