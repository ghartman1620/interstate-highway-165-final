var w = 1000;
var h = 600;

//Define map projection
var projection = d3.geoAlbersUsa()
                   .translate([w/2, h/2])
                   .scale([1000]);

//Define path generator
var path = d3.geoPath()
                 .projection(projection);

//Create SVG element
var svg = d3.select("svg")
            
            .attr("width", w)
            .attr("height", h);

//Load in GeoJSON data
d3.json("../data/interstates_small.json", function(interstates){
    //Bind data and create one path per GeoJSON feature

//
//    svg.selectAll("path")
//        .data(interstates.features)
//        .enter()
//        .append("path")
//        .attr("d", path)
//        .attr("stroke", "blue")
//        .attr("fill-opacity", 0.0);
    let i5 = interstates.features.filter(d=> d.properties.ROUTE_NUM === "I5")
    console.log(i5);
    svg.selectAll("path")
        .data(i5)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill-opacity", 0.0)
        .attr("stroke", "black")

});
