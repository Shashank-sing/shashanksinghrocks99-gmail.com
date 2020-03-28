 // set the dimensions and lgmargins of the graph
 var lgmargin = { top: 20, right: 20, bottom: 30, left: 50 },
 width = 672 - lgmargin.left - lgmargin.right,
 height = 350 - lgmargin.top - lgmargin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%Y");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the 1st line
var valueline = d3.line()
 .x(function (d) { return x(d.date); })
 .y(function (d) { return y(d.close); });

// define the 2nd line
var valueline2 = d3.line()
 .x(function (d) { return x(d.date); })
 .y(function (d) { return y(d.open); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left lgmargin
var svg = d3.select("#lg").append("svg")
 .attr("width", width + lgmargin.left + lgmargin.right)
 .attr("height", height + lgmargin.top + lgmargin.bottom)
 .append("g")
 .attr("transform",
   "translate(" + lgmargin.left + "," + lgmargin.top + ")");

// Get the data
d3.csv("https://raw.githubusercontent.com/Shashank-sing/shashanksinghrocks99-gmail.com/master/data2.csv", function (error, data) {
 if (error) throw error;

 // format the data
 data.forEach(function (d) {
   d.date = parseTime(d.date);
   d.close = +(d.close/1000000000);
   d.open = +(d.open/1000000000);
 });

 // Scale the range of the data
 x.domain(d3.extent(data, function (d) { return d.date; }));
 y.domain([0, d3.max(data, function (d) {
   return Math.max(d.close, d.open);
 })]);

 // Add the valueline path.
 svg.append("path")
   .data([data])
   .attr("class", "line")
   .attr("d", valueline);

 // Add the valueline2 path.
 svg.append("path")
   .data([data])
   .attr("class", "line")
   .style("stroke", "red")
   .attr("d", valueline2);

 // Add the X Axis
 svg.append("g")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).ticks(d3.timeYear.every(1)));

 // Add the Y Axis
 svg.append("g")
   .call(d3.axisLeft(y));  

});