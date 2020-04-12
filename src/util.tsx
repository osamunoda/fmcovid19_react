/** sanitize(csv: string) :string[] */
/**
 * Convert csv into an array
 * In each element,
 * allowed characters: 0-9a-zA-Z (space),(comma).(period)
 * Other characteres are eliminated.
 */
export const sanitize = (csv: string | null) => {
    if (!csv) return [];

    const arr = csv.split("\n");
    const result = arr.map(item => item.split(/[^0-9a-zA-Z ,.]/).join(""))
    return result;
};

/**
 * summerize(csv: string|null) : CovidData[]
 */
export type CovidData = {
    name: string,
    data: number[],
    latest: number
};
/**
 * assumed csv data from https://github.com/CSSEGISandData/COVID-19
 * @param csv : Province/State,Country/Region,Lat,Long,1/22/20,1/23/20,...
 */
export const summerize = (csv: string | null) => {
    const arr = sanitize(csv);
    const countries: CovidData[] = [];
    /** in case of csv is null/empty */
    if (!arr[0]) return countries;

    arr.forEach(row => {
        const data = row.split(",");
        /** exclude countries which is reported by state */
        if (data[0] || countries.find(item => item.name === data[1])) return;
        /** make a CovidData object */
        countries.push({
            name: data[1],
            data: data.slice(4).map(item => Number(item)),
            latest: Number(data[data.length - 1])
        });
    });
    const dataLength = countries[0].data.length;
    addCountry(arr, countries, "Australia", dataLength);
    addCountry(arr, countries, "China", dataLength);
    addCountry(arr, countries, "Canada", dataLength, ["Diamond Princess", "Recovered"]);
    return countries;
}

/**
 * addCountry
 * used in summerized fuction
 * make a CovidData object of the country which is excluded because of state-based case report
 * @param arr array from sanitized csv
 * @param allCountries CovidData[]
 * @param countryName  Country name which is excluded in summerized function
 * @param dataLength data length of covid19 cases daily report
 * @param excludes special words to be excluded from country-based summary
 */
export const addCountry = (arr: string[], allCountries: CovidData[], countryName: string, dataLength: number, excludes: string[] = []) => {
    const country_states = arr.filter(row => {
        const state = row.split(",")[0];
        if (excludes) {
            return row.match(countryName) && !excludes.includes(state)
        } else {
            return row.match(countryName);
        }
    });
    const country: CovidData = {
        name: countryName,
        data: Array(dataLength).fill(0),
        latest: 0
    };
    country_states.forEach(row => {
        const data = row.split(",").slice(4).map(item => Number(item));
        country.data.forEach((item, index) => {
            country.data[index] = item + data[index];
        });
    });
    country.latest = country.data[country.data.length - 1];
    allCountries.push(country);
}
/**
 * getActive : calculate (confirmed - death - recovered)
 * @param confirmed CovidData[]
 * @param death CovidData[]
 * @param recovered CovidData[]
 */
export const getActive = (confirmed: CovidData[], death: CovidData[], recovered: CovidData[]) => {
    const active: CovidData[] = [];
    for (let i = 0; i < confirmed.length; i++) {
        const country = confirmed[i].name;
        const d_data = death.find(item => item.name === country);
        const r_data = recovered.find(item => item.name === country);
        let d_arr = Array(confirmed[0].data.length).fill(0);
        let r_arr = Array(confirmed[0].data.length).fill(0);
        if (d_data) {
            d_arr = d_data.data;
        }
        if (r_data) {
            r_arr = r_data.data;
        }
        const arr = confirmed[i].data.map((d, i) => (d - d_arr[i] - r_arr[i]));
        active.push({ name: country, data: arr, latest: arr[arr.length - 1] })
    }
    return active;
}
/*
function LineChart(data, elmID, config) {
    const countries = data;
    const width = config.width, height = config.height, margin = config.margin;
    d3.select(elmID).style("width", width).style("height", height);
    const maxY = d3.max(countries.map(item => item.latest).concat([1000000]));
    // scale
    const scaleX = d3.scaleLinear().domain([0, countries[0].data.length]).range([margin, width - margin]);
    const scaleY = d3.scaleLog(10).clamp(true).domain([1, maxY]).range([height - margin, margin]);

    //axes
    const axisX = d3.axisBottom(scaleX);
    const axisY = d3.axisLeft(scaleY).ticks(10, 0).tickSize(chart_config.margin * 2 - chart_config.width).ticks(5).tickFormat(d => d);
    d3.select("svg").selectAll("g").remove();
    d3.select("svg").append("g").call(axisY).attr("transform", `translate(${margin},0)`);
    d3.select("svg").append("g").call(axisX).attr("transform", `translate(0, ${height - margin})`);
    // Data filtering
    const filtered = countries.filter(country => state.countries.indexOf(country.name) !== -1);
    const svg = d3.select(elmID);
    // Draw lines
    svg.selectAll("path.line").data(filtered.map(item => item.data)).join("path").attr("class", "line").attrs({
        d: d3.line().x((d, i) => scaleX(i)).y((d, i) => scaleY(d)),
        stroke: (d, i) => colorScale(state.countries.indexOf(filtered[i].name)),
        fill: "none",
        "stroke-width": 2
    });
    // show country name at the end of line
    svg.selectAll("text.cname").data(filtered).join("text").attr("class", "cname").attrs({
        x: (d, i) => scaleX(d.data.length),
        y: (d, i) => scaleY(d.data[d.data.length - 1]),
        stroke: "none",
        fill: (d, i) => colorScale(state.countries.indexOf(d.name))
    }).text(d => d.name);
}
function BarChart(data, elmID, type, config) {
    const countries = data;
    const country = countries.find(item => item.name === state.country);
    const width = config.width, height = config.height, margin = config.margin;
    const cases_day = country.data.map((item, index, arr) => index === 0 ? item : (arr[index] - arr[index - 1]));
    const bar_width = (width - margin * 2) / cases_day.length;
    const svg = d3.select(elmID);
    svg.style("width", width).style("height", height);
    const maxY = type === "logarithmic" ? 100000 : getMaxLineValue(d3.max(cases_day));
    // scale
    const scaleX = d3.scaleLinear().domain([0, cases_day.length]).range([margin, width - margin]);
    const scaleY = type === "logarithmic" ? d3.scaleLog(10).clamp(true).domain([1, maxY]).range([height - margin, margin]) : d3.scaleLinear().domain([0, maxY]).range([height - margin, margin]);
    //axes
    const axisX = d3.axisBottom(scaleX);
    const axisY = d3.axisLeft(scaleY).ticks(10, 0).tickSize(chart_config.margin * 2 - chart_config.width).ticks(5).tickFormat(d => d);
    svg.selectAll("g").remove();
    svg.append("g").call(axisY).attr("transform", `translate(${margin},0)`);
    svg.append("g").call(axisX).attr("transform", `translate(0, ${height - margin})`);
    // Data filtering
    svg.selectAll("rect").data(cases_day).join("rect").attrs({
        stroke: "white",
        fill: "#333",
        x: (d, i) => (scaleY(0) - scaleY(d)) > 0 ? scaleX(i) : 0,
        y: d => scaleY(d),
        width: bar_width,
        height: d => Math.abs(scaleY(0) - scaleY(d))
    });
}*/
/**
 * getMaxLineValue(num:numbner)
 * get the chart axis max value to display
 * @param num 
 */
export const getMaxLineValue = (num: number) => {
    const numStr = num + "";
    const firstNum = numStr.slice(0, 1);
    const nextNum = Number(firstNum) + 1;
    const upperLineValue = nextNum * 10 ** numStr.slice(1).length;
    return Number(upperLineValue);
}
