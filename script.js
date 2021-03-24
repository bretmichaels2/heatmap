const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

// colors

const colors = ["#220ac2", "#0b6ad6", "#1bdef7", "#1bf7aa", "#94f71b", "#f1ff54", "#ffc926", "#ff8d0a", "#ff5c0a", "#ff2e2e", "#b3051f", "#80061f"];

//establishing graph

const w = 1500;
const h = 450;
const m = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 80 };



const body = d3.select("body");
const main = body.append("div").
attr("id", "main");

const title = main.append("h2").
text("Monthly Global Land-Surface Temperature").
attr("id", "title");

const description = main.append("h2").
attr("id", "description");

const svg = main.append("svg").
attr("id", "map").
attr("width", w).
attr("height", h);

const x = d3.scaleLinear().
range([m.left, w - m.right]);
const y = d3.scaleLinear().
range([m.top, h - m.bottom]);
const z = d3.scaleLinear().
range([0, colors.length - 1]);

const xAxis = d3.axisBottom(x).
tickSize(0).
tickFormat(d3.format("d"));
const yAxis = d3.axisLeft(y).
tickSize(0).
tickFormat(function (val) {
  var date = new Date();
  date.setMonth(val);
  return d3.timeFormat("%B")(date);
});

// establish legend

const lw = 600;
const lh = 80;
const lm = {
  top: 20,
  right: m.right,
  bottom: 20,
  left: m.left };


const legend = main.append("svg").
attr("id", "legend").
attr("width", lw).
attr("height", lh);

const l = d3.scaleLinear().
range([lm.left, lw - lm.right]);

const legendAxis = d3.axisBottom(l).
ticks(colors.length).
tickSize(0).
tickFormat(d3.format(".1f"));

// establish tooltip

const tooltip = main.append("div").
attr("id", "tooltip").
style("opacity", 0).
text("tooltip");

// get data

d3.json(url, function (error, data) {

  //map data

  const dataset = data.monthlyVariance;
  const years = dataset.map(val => val.year);
  const months = dataset.map(val => val.month - 1);
  const variance = dataset.map(val => Math.round(val.variance * 10) / 10);
  const temps = dataset.map(val => Math.round((val.variance + data.baseTemperature) * 100) / 100);

  description.html(d3.min(years) + " - " + d3.max(years) + ": base temperature " + data.baseTemperature + "&#176; Celsius");

  //fix and call x and y axis

  x.domain([d3.min(years), d3.max(years)]);
  y.domain([0, 11]);

  svg.append("g").
  attr("transform", "translate(0 " + (h - m.bottom / 1.5) + ")").
  attr("class", "label").
  attr("id", "x-axis").
  attr("stroke", "white").
  call(xAxis).
  select(".domain").remove();

  svg.append("g").
  attr("transform", "translate(" + m.left + ", 0)").
  attr("class", "label").
  attr("id", "y-axis").
  attr("stroke", "white").
  call(yAxis).
  select(".domain").remove();

  // legend axis

  const lBarWidth = (lw - lm.right - lm.left) / colors.length;
  const lBarHeight = lh - lm.top - lm.bottom;

  l.domain([d3.min(temps), d3.max(temps)]);

  legend.append("g").
  attr("transform", "translate(" + lBarWidth / 3 + ", " + (lh - lm.bottom / 1.5) + ")").
  attr("stroke", "white").
  call(legendAxis).
  select(".domain").remove();

  //create legend

  const lRect = legend.selectAll("rect").
  data(colors).
  enter().
  append("rect").
  attr("width", lBarWidth).
  attr("height", lBarHeight).
  attr("x", (d, i) => i * lBarWidth + lm.left).
  attr("y", lm.top).
  attr("fill", (d, i) => d);


  // attributes of main graph 

  function colorPicker(val) {
    if (val < 13) {
      var rounded = Math.round(val);
      return colors[rounded];
    } else
    {
      return "white";
    }
  };

  z.domain([d3.min(temps), d3.max(temps)]);

  const scaledTemps = temps.map(val => z(val));
  const scaledYears = years.map(val => x(val));
  const scaledMonths = months.map(val => y(val));

  const barWidth = (w - m.right - m.left) / (years.length / 12);
  const barHeight = (h - m.top - m.bottom) / 11;

  // main graph

  const rect = svg.selectAll("rect").
  data(dataset).
  enter().
  append("rect").
  attr("class", "cell").
  attr("width", barWidth).
  attr("height", barHeight).
  attr("x", (d, i) => scaledYears[i]).
  attr("y", (d, i) => scaledMonths[i] - 15).
  attr("data-month", (d, i) => d.month - 1).
  attr("data-year", (d, i) => d.year).
  attr("data-temp", (d, i) => d.variance + data.baseTemperature).
  attr("fill", (d, i) => colorPicker(scaledTemps[i]));

  // mouseover

  function month(val) {
    var date = new Date();
    date.setMonth(val);
    return d3.timeFormat("%b")(date);
  };

  rect.on("mouseover", function (d, i) {
    d3.select(this).
    attr("fill", "black");
    tooltip.attr("data-year", d.year).
    style("opacity", 1).
    style("top", event.pageY - 100 + "px").
    style("left", event.pageX - 50 + "px").
    html(d.year + "- " + month(d.month - 1) + "<br>" + temps[i] + "&#176;<br>" + d.variance + "&#176;");

  });

  rect.on("mouseout", function (d, i) {
    d3.select(this).
    attr("fill", colorPicker(scaledTemps[i]));
    tooltip.style("opacity", 0);
  });


});