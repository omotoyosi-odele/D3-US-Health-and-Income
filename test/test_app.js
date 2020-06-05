var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("data.csv").then(function (scatterData) {


  // Step 1: Parse Data/Cast as numbers
  // ==============================
  scatterData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });

  // Step 2: Create scale functions
  // ==============================
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  function xScale(scatterData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(scatterData, d => d[chosenXAxis]),
      d3.max(scatterData, d => d[chosenXAxis] + 1)
      ])
      .range([0, width]);

    return xLinearScale;

  }

  function yScale(scatterData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(scatterData, d => d[chosenYAxis]),
      d3.max(scatterData, d => d[chosenYAxis] + 2)])
      .range([height, 0]);

    return yLinearScale;

  }

  x = xScale(scatterData, chosenXAxis);
  y = yScale(scatterData, chosenYAxis);

  // Step 3: Create axis functions
  // ==============================
  var bottomAxis = d3.axisBottom(x);
  var leftAxis = d3.axisLeft(y);

  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  // Step 4: Append Axes to the chart
  // ==============================
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Step 5: Create Circles
  // ==============================
  var circlesGroup = chartGroup.selectAll("g circle")
    .data(scatterData)
    .enter()

  circlesGroup
    .append("circle")
    .attr("cx", d => x(d.poverty))
    .attr("cy", d => y(d.healthcare))
    .attr("r", "15")
    .attr("fill", "pink")
    .attr("opacity", ".5");

  circlesGroup
    .append("text")
    .text(d => d.abbr)//d => d.abbr)
    .attr("x", d => x(d.poverty))
    .attr("y", d => y(d.healthcare) + 5)
    .attr("text-anchor", "middle")
    .attr("font-size", 13)
    .attr("fill", "gray");

  function renderXCircles(_circlesGroup, newXScale, chosenXAxis) {

    _circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return _circlesGroup;
  }

  function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  // Step 6: Initialize tool tip
  // ==============================
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -1])
    .html(function (d) {
      return (`${d.state}<br>Poverty: ${d.poverty}%<br>Lacks Healthcare: ${d.healthcare}%`);
    });

  // Step 7: Create tooltip in the chart
  // ==============================
  svg.call(toolTip);

  // Step 8: Create event listeners to display and hide the tooltip
  // ==============================
  svg.selectAll("circle").on("click", function (data) {    
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .attr("text-anchor", "middle")
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .attr("text-anchor", "middle")
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .attr("text-anchor", "middle")
    .text("Household Income (Median)");

  // append y axis
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 50)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("active", true)
    .attr("text-anchor", "middle")
    .text("Lacks Healthcare (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 30)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("inactive", true)
    .attr("text-anchor", "middle")
    .text("Smokes (%)");

  var obeseLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 10)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("inactive", true)
    .attr("text-anchor", "middle")
    .text("Obese (%)");

  xLabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        // updates x scale for new data
        x = xScale(scatterData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(x, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, x, chosenXAxis);

        // updates tooltips with new info
        // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        /*         if (chosenXAxis === "num_albums") {
                albumsLabel
                  .classed("active", true)
                  .classed("inactive", false);
                hairLengthLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else {
                albumsLabel
                  .classed("active", false)
                  .classed("inactive", true);
                hairLengthLabel
                  .classed("active", true)
                  .classed("inactive", false);
              } */
      }
    });
  yLabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        y = yScale(scatterData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(y, yAxis);
      }
    });
}).catch(function (error) {
  console.log(error);
});
