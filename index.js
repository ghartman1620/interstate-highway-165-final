const mapWidth = 1500;
const mapHeight = 500;
const graphWidth = 1500;
const graphHeight = 400;

const graphPadding = 50;

const barGraphColorDefault = "#808080";
const barGraphColorHighlighted = "#303030";

//Define map projection
var projection = d3.geoAlbersUsa()
                   .translate([mapWidth/2, mapHeight/2])
                   .scale([1000]);

//Define path generator
var path = d3.geoPath()
                 .projection(projection);

//Create SVG element
var map = d3.select("#map")
            
            .attr("width", mapWidth)
            .attr("height", mapHeight);

var graph = d3.select("#graph")
            .attr("width", graphWidth)
            .attr("height", graphHeight)
        

/*
  Slider code from https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
*/
var data3 = d3.range(0, 108).map(function (d) { return new Date(1900 + d, 10, 3); });

var slider = d3.sliderHorizontal()
    .min(d3.min(data3))
    .max(d3.max(data3))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(800)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(data3.filter(d => d.getYear()%10===0))


var g = d3.select("div#slider").append("svg")
    .attr("width", graphWidth)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

g.call(slider);
d3.select("p#value").text(d3.timeFormat('%Y')(slider.value()));

 slider.on('onchange', val => {
    d3.select("p#value").text(d3.timeFormat('%Y')(val));
    year = val.getYear() + 1900;
    graph.selectAll("rect")
        .attr("fill", d => d.year === year ? barGraphColorHighlighted : barGraphColorDefault);
});

var xBarScale = d3.scaleBand().rangeRound([graphPadding,  graphWidth-graphPadding]).padding(0.1);

var yBarScale = d3.scaleLinear().range([ graphPadding, graphHeight-graphPadding,]);


var year = slider.value().getYear() + 1900;


/*
  Here are a series of data parsing objects - they contain some functions
  useful to draw a particular dataset. A single one will be passed to drawBarGraph()
*/

// highway deaths per capita data. to be passed fatalities.csv data.
const fatalitiesPerCapita = {
    domain: (data) => [d3.max(data, d => 
        
        //i Really enjoy how when I divide by d.popluation instead of d.population instead of crashing or erroring or doing SOMETHING,
        //javascript returns motherfucking NaN from this function and makes the rest of the thing silently not work
        //instead of throwing a godamn error. FUCKYOU.JS
        
        (100000 * d.highwayFatalitiesTotal/d.population)), 0],
    text: () => "Highway Fatalities Per 100,000 People",
    datum: (d) => 100000*d.highwayFatalitiesTotal/d.population,
    
};

//highway deaths per vehicle miles travelled. to be passed fatalities.csv data.
const fatalitiesPerVmt = {
    domain: (data) => [d3.max(data, d => 
        
        //i Really enjoy how when I divide by d.popluation instead of d.population instead of crashing or erroring or doing SOMETHING,
        //javascript returns motherfucking NaN from this function and makes the rest of the thing silently not work
        //instead of throwing a godamn error. FUCKYOU.JS
        
        (d.perVmt)), 0],
    text: () => "Highway Fatalities Per 100 Million Annual Vehicle Miles Travelled",
    datum: (d) => d.perVmt,
    
};


const driveCarsToWork = {
    domain: (data) => [d3.max(data, d => d.droveCars), 0],
    text: () => "Number of Americans Who Drive Cars to Work",
    datum: (d) => d.droveCars,
}

const publicTransportation = {
    domain: (data) => [d3.max(data, d => d.publicTransportation), 0],
    text: () => "Number of Americans Who Take Public Transportation to Work",
    datum: (d) => d.publicTransportation,
}



function drawBarGraph(dataParser, data) {
    
    yBarScale.domain(dataParser.domain(data));
    var barYAxis = d3.axisRight(yBarScale);   
    graph.selectAll(".y-axis").remove();
    graph.append("g")
        .call(barYAxis)
        .attr("class", "y-axis")
        .attr("transform", `translate(${graphPadding/2+10}, 0)`)
    graph.append("g")
        .append("text")
        .attr("class", "y-axis")
        .attr("fill", "#D3D3D3")
        .attr("x", -graphHeight/2)
        .attr("y", "1em")
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        
        .text(dataParser.text())
    
    
    //Transition: Yay or nay?
    graph.selectAll("rect")
        .transition()
        .attr("height", d => (graphHeight-graphPadding)-yBarScale(dataParser.datum(d)))
        .attr("x", d => xBarScale(d.year))
        .attr("y", d => yBarScale(dataParser.datum(d)))
        .attr("width", xBarScale.bandwidth())
        .attr("fill", d => d.year === year ? barGraphColorHighlighted: barGraphColorDefault);
}


//Load in GeoJSON data
d3.json("data/usroads.json", function(error, usroads) {
  if (error) throw error;
    d3.csv("data/fatalitiesAndCommute.csv", function(fatalitiesAndCommute){
        fatalitiesAndCommute.forEach(d => {
            d.year = +d.year;
            d.perVmt = !d.perVmt ? 0 : +d.perVmt;
            d.highwayFatalitiesTotal = !d.highwayFatalitiesTotal ? 0 : +d.highwayFatalitiesTotal;
            d.population = +d.population;
            d.droveCars = !d.droveCars ? 0 : +d.droveCars;
            d.publicTransportation = !d.publicTransportation ? 0 : +d.publicTransportation;
            d.drovePct = !d.drovePct ? 0 : +d.drovePct;
            d.publicPct = !d.publicPct ? 0 : +d.publicPct;

        })


//0. Map each radio selector to a dataParser object we made above.


            const dataSelection = {
                "fatalitiesPerCapita" : fatalitiesPerCapita,
                "fatalitiesPerVmt" : fatalitiesPerVmt,
                "driveCarsToWork" : driveCarsToWork,
                "publicTransportation" : publicTransportation,
            }
//1. Draw map
            // from https://gist.github.com/bricedev/96d2113bd29f60780223
            map.append("rect")
                .attr("fill", "white")
                .attr("stroke", "#FFFFFF")
                .attr("width", mapWidth)
                .attr("height", mapHeight)
            
            majorHighways = topojson.feature(usroads, usroads.objects.roads).features.filter(d => d.properties.type === "Major Highway")
            console.log(majorHighways);
            longMajorHighways = majorHighways.filter(d=>d.geometry.coordinates.length > 1);
            console.log(longMajorHighways);
            map.append("g")
                .selectAll("path")
                .data(topojson.feature(usroads, usroads.objects.usa).features)
                .enter().append("path")
                .attr("d", path)
                .attr("fill-opacity","0")
                .style("stroke","#252525")
                .style("stroke-width",1);
            map.append("g")
                .selectAll("path")
                .data(longMajorHighways)
                .enter().append("path")
                .attr("d", path)
                .attr("stroke-width", 2)
                .attr("class",function(d) { return "roads " + d.properties.type.toLowerCase().split(' ').join('-'); });

//1.5 Make map zoomable (from book chapter 14 example 16)
            /*var zooming = function(d) {

				//Log out d3.event.transform, so you can see all the goodies inside
				//console.log(d3.event.transform);

				//New offset array
				var offset = [d3.event.transform.x+mapWidth/2, d3.event.transform.y+mapHeight/2];

				//Calculate new scale
				var newScale = d3.event.transform.k * 1000;

				//Update projection with new offset and scale
				projection.translate(offset)
						  .scale(newScale);

				//Update all paths and circles
				map.selectAll("path")
					.attr("d", path);
			}
            //Then define the zoom behavior
			var zoom = d3.zoom()
						 .scaleExtent([ 0.2, 2.0 ])
						 .translateExtent([[ -1200, -700 ], [ 1200, 700 ]])
						 .on("zoom", zooming);
            map.call(zoom);*/
//2. Create X axis and scale (never change)
            xBarScale.domain(fatalitiesAndCommute.map(d => d.year));                

            var barXAxis = d3.axisBottom(xBarScale)
                    .tickValues([1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000]);
            graph.append("g")
                .call(barXAxis)
                .attr("transform", `translate(0, ${graphPadding/2})`)
            graph.append("g")
                .append("text")

                .attr("x", graphWidth/2)
                .attr("y", graphPadding/2)
                .attr("text-anchor", "middle")
                .attr("fill", "#000")
                .text("Year")



//3. Initially bind rectangles to our data.

            graph.selectAll("rect")
                .data(fatalitiesAndCommute).enter()
                .append("rect")


            drawBarGraph(fatalitiesPerCapita, fatalitiesAndCommute);

//4 Set up interactivity that relies on our data. 

            //This trick from https://stackoverflow.com/questions/41075140/toggle-between-selected-radio-button-using-d3
            d3.selectAll("input[name='dataSelection']").on("change", function(){
                drawBarGraph(dataSelection[this.value], fatalitiesAndCommute);
            });


    });
});