import React, { useState, useEffect } from 'react';
import './App.css';
import Section2 from './Section2';
import Burger from './Burger';
import SidePanel from './SidePanel';
import Spinner from './Spinner';
import ListColumn from './ListColumn';
import { CovidData, summerize, getActive } from './util';
import * as d3 from 'd3';
import 'd3-selection-multi';
import LineChart from './LineChart';
import BarChart from './BarChart';

type State = {
  confirmed: CovidData[],
  death: CovidData[],
  recovered: CovidData[],
  active: CovidData[],
  confirmed_daily: CovidData[],
  death_daily: CovidData[],
  recovered_daily: CovidData[],
  active_daily: CovidData[],
  countries: string[],
  country: string,
  axisType: string,
  selectedType: string,
  accessStorage: boolean
};

function App() {
  /** CONSTANTS */
  const panelWidth = 250;
  const sectionHeight = 350;
  const cellHeight = 50;
  const criticalPoint = 1024;
  const url_confirmed = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
  const url_death = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
  const url_recovered = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";

  const urls = [url_confirmed, url_death, url_recovered];
  const defaultState: State = {
    confirmed: [],
    death: [],
    recovered: [],
    active: [],
    confirmed_daily: [],
    death_daily: [],
    recovered_daily: [],
    active_daily: [],
    countries: ["US", "Italy", "Japan"],
    country: "Japan",
    axisType: "linear",
    selectedType: "confirmed",
    accessStorage: true
  };
  /** UseState */
  const [panelShow, setPanel] = useState(false);
  const [panel2Show, setPanel2] = useState(false);
  const [burgerShow, setBurgerShow] = useState(false);
  const [panelHeight, setPanelHeight] = useState(sectionHeight);
  const [showSpin, setSpin] = useState(true);
  const [state, setState] = useState(defaultState);
  const defaultCovidData: CovidData[] = [];
  const [chartData, setChartData] = useState(defaultCovidData);
  const [country, setCountry] = useState(defaultState.country);
  const defaultCountries: string[] = ["US", "Italy", "Japan"];
  const [countries, setCountries] = useState(defaultCountries);
  const [chartWidth, setChartWidth] = useState(500);
  const [singleData, setSingleData] = useState({} as CovidData);
  const defaultkey = "confirmed" as keyof State;
  const [type, setType] = useState(defaultkey);
  const [axisType, setAxisType] = useState(state.axisType);
  const emptyArray: string[] = [];
  const [listData, setListData] = useState(emptyArray);
  const [currentData, setCurrentData] = useState(state.confirmed);
  /**
   * Event Handlers
   */
  let timer: any = null;
  window.onresize = function () {
    timer = setTimeout(() => {
      if (timer) {
        clearTimeout(timer);
      }
      const section = document.querySelector("section");
      if (section) {
        const chart_width = window.innerWidth >= criticalPoint ? 640 : Math.min(window.innerWidth * 0.9, 640)
        setChartWidth(chart_width);
        setBurgerShow(window.innerWidth < criticalPoint)
      }
    }, 200);
  }
  /** UseEffect */
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      const mainTop = main.getBoundingClientRect().top;
      setPanelHeight(mainTop);
    }
  }, []);

  useEffect(() => {
    Promise.all(urls.map(url => fetch(url).then(response => response.text())))
      .then(result => {
        const obj = { ...state };
        obj.confirmed = summerize(result[0]).sort((a, b) => b.latest - a.latest);
        obj.death = summerize(result[1]).sort((a, b) => b.latest - a.latest);
        obj.recovered = summerize(result[2]).sort((a, b) => b.latest - a.latest);
        obj.active = getActive(obj.confirmed, obj.death, obj.recovered);
        obj.confirmed_daily = calcDayByDay(obj.confirmed);
        obj.death_daily = calcDayByDay(obj.death);
        obj.recovered_daily = calcDayByDay(obj.recovered);
        obj.active_daily = calcDayByDay(obj.active);

        //setup_optionHandlers();
        const headerRow = result[0].split("\n")[0].split(",");
        d3.select("#latestDate").text("Last Updated: " + headerRow[headerRow.length - 1]);
        // Handlers
        d3.selectAll("#typeSelection input[type='radio']+label").on("click", (d, i, n) => {
          const option = n[i] as HTMLElement;
          if (option) {
            const optionType = option.textContent?.toLowerCase() as (keyof State);
            setType(optionType);
          }
        });
        d3.selectAll("#axisType input[type='radio']+label").on("click", (d, i, n) => {
          const option = n[i] as HTMLElement;
          if (option) {
            const optionType = option.textContent || "logarithmic";
            setAxisType(optionType);
          }
        });
        setState(obj);
        const filteredData = obj.confirmed.filter(item => countries.indexOf(item.name) !== -1);

        setChartData(filteredData);
        const single_Data = obj.confirmed.find(item => item.name === country);
        setSingleData(single_Data || {} as CovidData);
        setBurgerShow(window.innerWidth < criticalPoint);
        setPanelHeight(sectionHeight);
        setCurrentData(obj.confirmed);
        setSpin(false);
        const chart_width = window.innerWidth >= criticalPoint ? 640 : Math.min(window.innerWidth * 0.9, 640);
        setChartWidth(chart_width);
      });
  }, []);
  useEffect(() => {
    const listData = calcColumnData(state.confirmed);
    setListData(listData)
  }, [state]);
  useEffect(() => {
    const single_Data = currentData.find(item => item.name === country);
    setSingleData(single_Data || {} as CovidData);
    setCountry(country);
  }, [country, type, currentData]);

  useEffect(() => {
    if (type === "death") {
      setChartData(state.death.filter(item => countries.indexOf(item.name) !== -1));
      setCurrentData(state.death);
      setListData(calcColumnData(state.death));
    } else if (type === "recovered") {
      setChartData(state.recovered.filter(item => countries.indexOf(item.name) !== -1));
      setCurrentData(state.recovered);
      setListData(calcColumnData(state.recovered));
    } else if (type === "active") {
      setChartData(state.active.filter(item => countries.indexOf(item.name) !== -1));
      setCurrentData(state.active);
      setListData(calcColumnData(state.active));
    } else {
      setChartData(state.confirmed.filter(item => countries.indexOf(item.name) !== -1));
      setCurrentData(state.confirmed);
      setListData(calcColumnData(state.confirmed));
    }

  }, [type, state.death, state.recovered, state.active, state.confirmed, countries]);

  /** Helper Function */
  /**
   * countriesUpdate
   * @param arr 
   * @param name 
   */
  const countriesUpdate = (original: string[], name: string = "") => {
    if (!name) return;
    let arr = [...original];
    if (arr.find(item => item === name)) {
      arr = arr.filter(item => item !== name);
    } else {
      arr.push(name)
    }
    return arr;
  };

  const calcColumnData = (covidDataArr: CovidData[]) => {
    const dataArr = covidDataArr.map((item, index) => (index + 1) + " " + item.name + ":::" + item.latest);
    return dataArr;
  };
  const calcDayByDay = (covidDataArr: CovidData[]) => {
    const cases_day = covidDataArr.map((country, index, arr) => {
      const totalData = [...country.data];
      const day_by_day = totalData.map((d, i, a) => {
        return i === 0 ? a[i] : a[i] - a[i - 1]
      });
      return { name: country.name, data: day_by_day, latest: day_by_day[day_by_day.length - 1] };
    });
    return cases_day;
    //return covidDataArr;
  };
  return (
    <div className="App">
      <header>
        <h1>Covid-19</h1>
      </header>
      <main>
        <div className="nav">
          <Burger size={40} color="#eee" className="icon" checked={false} show={burgerShow} clickHandler={() => { setPanel(!panelShow) }} />
          <h2><span>Total Count <br></br>Line Chart</span><span id="latestDate">Last Updated:</span></h2>
        </div>
        <div id="typeSelection">
          <input id="confirmed" type="radio" value="confirmed" name="type" defaultChecked={type === "confirmed" as (keyof State)} /><label htmlFor="confirmed">Confirmed</label>
          <input id="death" type="radio" value="death" name="type" defaultChecked={type === "death" as (keyof State)} /><label htmlFor="death">Death</label>
          <br></br>
          <input id="recovered" type="radio" value="recovered" name="type" defaultChecked={type === "recovered" as (keyof State)} /><label htmlFor="recovered">Recovered</label>
          <input id="active" type="radio" value="active" name="type" defaultChecked={type === "active" as (keyof State)} /><label htmlFor="active">Active</label>
        </div>
        <div className="section">
          <Section2 className="sec2" critical_point={criticalPoint} fixed_width={panelWidth} height={panelHeight} reverse={true} bgLeft="#333">
            <LineChart width={chartWidth} height={panelHeight} margin={50} className="left" data={chartData} items={countries} />
            <ListColumn clickHandler={(country: string | undefined) => { const arr = countriesUpdate(countries, country || ""); setCountries(arr || []); /*setChartData(state.confirmed.filter(item => (arr || []).indexOf(item.name) !== -1))*/ }} className="right" selectedItems={countries} keys={currentData.map(item => item.name)} data={listData} height={panelHeight} width={panelWidth} cellHeight={cellHeight} cellColor="#333" />
          </Section2>
          <SidePanel className="panel" _width={panelWidth} _height={panelHeight} show={panelShow} >
            <ListColumn clickHandler={(country: string | undefined) => { const arr = countriesUpdate(countries, country || ""); setCountries(arr || []); /*setChartData(state.confirmed.filter(item => (arr || []).indexOf(item.name) !== -1))*/ }} className="right" selectedItems={countries} keys={currentData.map(item => item.name)} data={listData} height={panelHeight} width={panelWidth} cellHeight={cellHeight} cellColor="#333" />
          </SidePanel>
        </div>

        <div className="nav">
          <Burger size={40} color="#eee" className="icon" checked={false} show={burgerShow} clickHandler={() => { setPanel2(!panel2Show) }} />
          <h2><span>Daily Count <br></br>Bar Chart</span><span id="selectedCountry">Selected Country:{country}</span></h2>
        </div>
        <div id="axisType">
          <input id="linear" type="radio" value="linear" name="axis_type" defaultChecked={axisType === "linear"} /><label htmlFor="linear">linear</label>
          <input id="logarithmic" type="radio" value="logarithmic" name="axis_type" defaultChecked={axisType === "logarithmic"} /><label htmlFor="logarithmic">logarithmic</label>
        </div>
        <div className="section">
          <Section2 className="sec2" critical_point={criticalPoint} fixed_width={panelWidth} height={panelHeight} reverse={true} bgLeft="#333">
            <BarChart barColor="tomato" width={chartWidth} height={panelHeight} margin={50} className="left" data={singleData} item={country} axisType={axisType} />
            <ListColumn clickHandler={(country: string | undefined) => { setCountry(country || "") }} className="right" selectedItem={country} keys={currentData.map(item => item.name)} data={currentData.map((item, index) => (index + 1) + " " + item.name + ":::" + item.latest)} height={panelHeight} width={panelWidth} cellHeight={cellHeight} />
          </Section2>
          <SidePanel className="panel" _width={panelWidth} _height={panelHeight} show={panel2Show} >
            <ListColumn clickHandler={(country: string | undefined) => { setCountry(country || "") }} className="right" selectedItem={country} keys={currentData.map(item => item.name)} data={currentData.map((item, index) => (index + 1) + " " + item.name + ":::" + item.latest)} height={panelHeight} width={panelWidth} cellHeight={cellHeight} />
          </SidePanel>
        </div>

      </main>
      <footer>contact: @sam_oda</footer>
      <Spinner show={showSpin} className="spinner" />
    </div>
  );
}

export default App;
