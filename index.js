const totalMapWidth = 2000;
const totalMapHeight = 900;


const mapX = 675;
const mapY = 0;
const mapWidth = 500;
const mapHeight = 350;

const graphX = 175;
const graphY = 437;
const graphWidth = 800;
const graphHeight = 400;
const graphPadding = 50;


const plotX = 1000;
const plotY = 437;
const plotWidth = 600;
const plotHeight = 400;
const plotPadding = 50;

const sliderX = 715;
const sliderY = 375;


const budgetWidth = 500;
const budgetHeight = 400;

const budgetPadding = 50;


const barGraphInterstatesDefault = "#8c96c6";
const barGraphInterstatesHighlight = "#88419d";
const barGraphOtherDefault = "#9ebcda";
const barGraphOtherHighlight = "#8c6bb1";

const plotCircleDefault = "#8c96c6";
const plotCircleHighlight = "#88419d";

//Define map projection
var projection = d3.geoAlbersUsa()
                   .translate([mapWidth/2, mapHeight/2])
                   .scale([500]);

//Define path generator
var path = d3.geoPath()
                 .projection(projection);

//Create SVG element
var svg = d3.select("#map")
    .attr("width", totalMapWidth)
    .attr("height", totalMapHeight);

            
var map = svg.append("g")
    .attr("transform", `translate(${mapX}, ${mapY})`)
    .attr("width", mapWidth)
    .attr("height", mapHeight);

var graph = svg.append("g")
    .attr("transform", `translate(${graphX}, ${graphY})`)
    .attr("width", graphWidth)
    .attr("height", graphHeight);
/*        
var budget = d3.select("#budget")
            .attr("width", budgetWidth)
            .attr("height", budgetHeight);*/

var plot = svg.append("g")
    .attr("transform", `translate(${plotX}, ${plotY})`)

    .attr("width", plotWidth)
    .attr("height", plotHeight)

/*

  Slider code from https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
*/
var data3 = d3.range(0, 42).map(function (d) { return new Date(1967 + d, 10, 3); });

var slider = d3.sliderHorizontal()
    .min(d3.min(data3))
    .max(d3.max(data3))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(400)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(data3.filter(d => d.getYear()%5===0));


var g = svg
    .append("g")
    .attr("transform", `translate(${sliderX}, ${sliderY})`);

g.call(slider);
d3.select("p#value").text(d3.timeFormat('%Y')(slider.value()));

let zBarScaleDefault = d3.scaleOrdinal()
    .range([barGraphInterstatesDefault, barGraphOtherDefault]);
let zBarScaleHighlight = d3.scaleOrdinal()
    .range([barGraphInterstatesHighlight, barGraphOtherHighlight]);




var xPlotScale = d3.scaleLinear().range([plotPadding, plotWidth-plotPadding]);

var yPlotScale = d3.scaleLinear().range([plotPadding, plotHeight-plotPadding]);


//var xRateGraph1Scale = d3.scaleBand().rangeRound([rateGraph1Padding, rateGraphWidth-rateGraphPadding]).padding(0.1);

//var yRateGraph1Scale = d3.scaleLinear().range([rateGraph1Padding, rateGraphHeight-rateGraphPadding]);

var year = slider.value().getYear() + 1900;



//Load in GeoJSON data
d3.json("usroads.json", function(error, usroads) {
    if (error) throw error;
    d3.csv("fatalitiesto2008.csv", function(fatalities){
        let obj = Object.assign({}, fatalities);

        fatalities.forEach(d => {
            d.year = +d.year;
            d.interstateTotalVmt = +d.interstateTotalVmt;
            d.otherNatlHighwayVmt = +d.otherNatlHighwayVmt;
            d.nonFedAidVmt = +d.nonFedAidVmt;
            d.otherFedAidVmt = +d.otherFedAidVmt;
            d.interstateFatalities = +d.interstateFatalities;
            d.otherNatlHighwayFatalities = +d.otherNatlHighwayFatalities;
            d.nonFedAidFatalities = +d.nonFedAidFatalities;
            d.otherFedAidFatalities = +d.otherFedAidFatalities;

            d.interstateMilage = +d.interstateMilage; //interstateMilage

            //deaths per 100,000,000 VMT
            d.interstateFatalityRate = d.interstateFatalities/d.interstateTotalVmt;
            d.otherHighwayVmt = (d.otherNatlHighwayVmt + d.nonFedAidVmt + d.otherFedAidVmt);

            d.otherHighwayFatality = (d.otherNatlHighwayFatalities + d.nonFedAidFatalities + d.otherFedAidFatalities);

            d.otherFatalityRate = d.otherHighwayFatality/d.otherHighwayVmt;
            console.log(d.interstateFatalityRate);
        })
        
        slider.on('onchange', val => {
            year = val.getYear() + 1900;

            graph.selectAll(".bar-group-rect")
                .attr("fill", function(d) {
                    if(d.year === year){
                        return zBarScaleHighlight(d.key);
                    } 
                    else{
                        return zBarScaleDefault(d.key);
                    }
                });

            plot.selectAll("circle")
                .attr("fill", function(d) {
                    return d.year === year ? plotCircleHighlight : plotCircleDefault;
                });
            map.select("#detail-text")
                .text(`${(fatalities.find(d => d.year===year).interstateMilage).toFixed(0)} miles of Interstate Highway in ${year}`)
        });



        //1. Draw map


        // from https://gist.github.com/bricedev/96d2113bd29f60780223
        map.append("rect")
            .attr("fill", "white")
            .attr("stroke", "#FFFFFF")
            .attr("width", mapWidth)
            .attr("height", mapHeight)

        

        majorHighways = topojson.feature(usroads, usroads.objects.roads).features.filter(d => d.properties.type === "Major Highway")
        longMajorHighways = majorHighways.filter(d=>d.geometry.coordinates.length > 1);
        map.append("g")
            .selectAll("path")
            .data(topojson.feature(usroads, usroads.objects.usa).features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill-opacity","0")
            .style("stroke","#737373")
            .style("stroke-width",1);
        map.append("g")
            .selectAll("path")
            .data(longMajorHighways)
            .enter().append("path")
            .attr("d", path)
            .attr("stroke-width", 2)    
            .attr("class",function(d) { return "roads " + d.properties.type.toLowerCase().split(' ').join('-'); });
        map.append("text")
            .attr("x", mapWidth/2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text("Extent of the Interstate Highway System");
        map.append("text")
            .attr("x", mapWidth/2)
            .attr("y", mapHeight-20)
            .attr("text-anchor", "middle")
            .attr("id", "detail-text")
            .text(`${(fatalities.find(d => d.year===year).interstateMilage).toFixed(0)} miles of Interstate Highway in ${year}`)

            let keys = ["interstateFatalityRate", "otherFatalityRate"]
        var xBarScale0 = d3.scaleBand().rangeRound([graphPadding,  graphWidth-graphPadding])
                .padding(0.1)
                .domain(fatalities.map(d => d.year));
        var xBarScale1 = d3.scaleBand().rangeRound([0, xBarScale0.bandwidth()]).padding(0.2);
        var yBarScale = d3.scaleLinear().range([ graphHeight-graphPadding, graphPadding]);


        //2. Draw grouped bar chart
        
        xBarScale1.domain(keys);
        yBarScale.domain([0, 1000*d3.max(fatalities, d => d3.max(keys, key => d[key]))]);        

        graph.selectAll("g")
            .data(fatalities)
            .enter().append("g")
            .attr("transform", d => `translate( ${xBarScale0(d.year)}, 0)`)
            .selectAll("rect")
                .data(d => keys.map(key => {return {key: key, year: d.year, value: 1000*d[key]}}))
                .enter().append("rect")
                .attr("class", "bar-group-rect")
                .attr("x", d => xBarScale1(d.key))
                .attr("y", d => yBarScale(d.value))
                .attr("height", d => graphHeight-graphPadding-yBarScale(d.value))
                .attr("width", xBarScale1.bandwidth())
                .attr("fill", function(d) {
                    if(d.year === year){
                        return zBarScaleHighlight(d.key);
                    } 
                    else{
                        return zBarScaleDefault(d.key);
                    }
                });
        
        var xBarAxis = d3.axisTop(xBarScale0)
                .tickValues(fatalities.filter(d => d.year%5 === 0).map(d => d.year));
        var yBarAxis = d3.axisRight(yBarScale)


        //x axis
        graph.append("g")
            .call(xBarAxis)
            .attr("transform", `translate(0, ${graphHeight-graphPadding/2})`);
        graph.append("g")
            .call(yBarAxis)
            .attr("transform", `translate(${graphPadding/2+10}, 0)`)
        graph.append("text")
            .attr("x", -graphHeight/2)
            .attr("y", graphPadding/2)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .text("Fatalities per 1 billion VMT")


        //x axis label
        graph.append("g")
            .append("text")

            .attr("x", graphWidth/2)
            .attr("y", graphHeight)
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .text("Year")

        //legend
        var legend = graph.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("text-anchor", "front")
            .selectAll("g")
            .data(keys)
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(" + (graphWidth-250) + "," + (50+i * 20) + ")"; });

        legend.append("rect")
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", zBarScaleDefault)
        legend.append("text")
            .text( d => {
                if(d == "interstateFatalityRate") return "Interstates"
                else return "Other Highways"
            })
            .attr("dx", 25)
            .attr("dy", 15);


        graph.append("text")
            .attr("text-anchor", "middle")
            .attr("x", graphWidth/2)
            .attr("y", 20)
            .text("Fatality Rate on Interstates and Other Highways*")



        //3. Draw scatterplot 
        
        let deathsPrevented = d => d.otherFatalityRate*d.interstateTotalVmt - d.interstateFatalityRate*d.interstateTotalVmt;

        scatterPlotDataset = fatalities.filter(d => d.interstateMilage);
        xPlotScale.domain([d3.min(scatterPlotDataset, d => d.interstateMilage), d3.max(scatterPlotDataset, d => d.interstateMilage)]);
        yPlotScale.domain([d3.max(scatterPlotDataset, d => deathsPrevented(d)), d3.min(scatterPlotDataset, d => deathsPrevented(d))]);

        //lives saved = nonInterstateFatalityRate*interstateVmt - interstateFatalityRate*interstateVmt;

        // nonInterstateFatalityRate = ()=

        var xPlotAxis = d3.axisTop(xPlotScale)

        plot.append("g")
            .call(xPlotAxis)
            .attr("transform", `translate(0 ${plotHeight-20})`);

        var yPlotAxis = d3.axisRight(yPlotScale)

        plot.append("g")
            .call(yPlotAxis)
            .attr("transform", "translate(20 0)");
        plot.selectAll("circle")
            .data(scatterPlotDataset)
            .enter().append("circle")
            .attr("stroke", "white")
            .attr("r", "8")
            .attr("cy", d => yPlotScale(deathsPrevented(d)))

            .attr("cx", d => xPlotScale(d.interstateMilage))
            .on("mouseover", d => {
                plot.selectAll("circle")
                    .attr("stroke", function(d1) {
                        
                        if(d1.year === d.year){
                            return "black"
                        }
                        else {
                            return "white"
                        }
                    });
                var group = plot
                    .append("g")
                    .attr("class", "tooltip");
                const TOOLTIP_OFFSET_LEFT = 495;
                const TOOLTIP_WIDTH = 480;
                const TOOLTIP_OFFSET_RIGHT = 25;
                group.append("rect")
                    .attr("width", TOOLTIP_WIDTH)
                    .attr("height", 125)
                    .attr("x", xPlotScale(d.interstateMilage)-TOOLTIP_OFFSET_LEFT-5)
                    .attr("rx", 5)
                    .attr("ry", 5)
                    .attr("y", yPlotScale(deathsPrevented(d))-50)

                //Is there a better way to put newlines between text in tooltips than this silly nonsense?
                group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale(deathsPrevented(d)))
                    .attr("dx", -TOOLTIP_OFFSET_LEFT)
                    .attr("dy", -23)
                    .text(d.year);
                group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale(deathsPrevented(d)))
                    .attr("dx", -TOOLTIP_OFFSET_LEFT)
                    .attr("dy", -3)
                    .attr("text-anchor", "right")
                    .text(`Miles Driven on Interstates:`);
                group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale(deathsPrevented(d)))
                    .attr("dx", -TOOLTIP_OFFSET_RIGHT)
                    .attr("dy", -3)
                    .attr("text-anchor", "end")
                    .text(`${(d.interstateTotalVmt/1000).toFixed(2)} Billion`);
                /*group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale)*/
                group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale(deathsPrevented(d)))
                    .attr("dx", -TOOLTIP_OFFSET_LEFT)
                    .attr("dy", 17)
                    .text(`Miles Driven on Other Highways:`);
                group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale(deathsPrevented(d)))
                    .attr("dx", -TOOLTIP_OFFSET_RIGHT)
                    .attr("dy", 17)
                    .attr("text-anchor", "end")
                    .text(`${(d.otherHighwayVmt/1000).toFixed(2)} Billion`);
            
            
                
                group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale(deathsPrevented(d)))
                    .attr("dx", -TOOLTIP_OFFSET_LEFT)
                    .attr("dy", 37)
                    .text(`Interstate Vehicle Death Rate:`);
                group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale(deathsPrevented(d)))
                    .attr("dx", -TOOLTIP_OFFSET_RIGHT)
                    .attr("dy", 37)
                    .attr("text-anchor", "end")
                    .text(`${(100*d.interstateFatalityRate).toFixed(2)} per 100 million VMT`);
                
            
            
                group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale(deathsPrevented(d)))
                    .attr("dx", -TOOLTIP_OFFSET_LEFT)
                    .attr("dy", 57)
                    .text(`Other Highway Vehicle Death Rate:`);
                group.append("text")
                    .attr("x", xPlotScale(d.interstateMilage))
                    .attr("y", yPlotScale(deathsPrevented(d)))
                    .attr("dx", -TOOLTIP_OFFSET_RIGHT)
                    .attr("dy", 57)
                    .attr("text-anchor", "end")
                    .text(`${(100*d.otherFatalityRate).toFixed(2)} per 100 million VMT`);
                
            })
            .on("mouseout", d => {
                plot.selectAll("circle").attr("stroke", "white");
                plot.selectAll(".tooltip").remove();
            })
            .attr("fill", function(d) {
                return d.year === year ? plotCircleHighlight : plotCircleDefault;
            });``
        plot.append("g").attr("class", "tooltip");
        plot.append("text")
            .attr("fill", "#D3D3D3")
            .attr("x", -plotHeight/2)
            .attr("y", "1em")
            .attr("transform", "rotate(-90)")

            .attr("fill", "#000")
            .attr("text-anchor", "middle")
            .text("Deaths Prevented by use of Interstates**")

        plot.append("text")
            .attr("fill", "#D3D3D3")
            .attr("x", plotWidth/2)
            .attr("y", plotHeight-5)
            .attr("fill", "#000")
            .attr("text-anchor", "middle")
            .text("Miles of Interstate Highway")

        plot.append("text")
            .attr("text-anchor", "middle")
            .attr("x", plotWidth/2)
            .attr("y", 20)
            .text("Death Mitigation by the Interstate Highway System")

    });
});


