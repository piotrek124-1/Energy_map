var svg = d3.select("svg"), width = window.innerWidth, height = window.innerHeight;
var projection = d3.geoNaturalEarth1().scale(width / 5.8).translate([width / 2.5, height / 2.1]);
var csvData = [];
d3.csv("https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv").then(function (data) {
    csvData = data;
});
function getEnergyData(countryName) {
    var data = csvData;
    function getData(rowName) {
        var x = [], y = [];
        var notEmptyValues = false;
        for (var i = 0; i < data.length; i++) {
            if (data[i]["country"] === countryName) {
                if (data[i][rowName] !== "") {
                    y.push(data[i][rowName]);
                    x.push(data[i]["year"]);
                    notEmptyValues = true;
                }
                else if (notEmptyValues === true) {
                    y.push(null);
                    x.push(data[i]["year"]);
                }
            }
        }
        if (notEmptyValues === false) {
        }
        return { x: x, y: y };
    }
    function createTrace(data, type, traceName, fill) {
        var result = {
            x: data.x,
            y: data.y,
            name: traceName,
            type: type
        };
        if (fill !== null) {
            // @ts-ignore
            result.fill = fill;
        }
        return result;
    }
    function createPlot(plotId, trace, layout, type, traceName, fill) {
        var data = [];
        for (var i = 0; i < trace.length; i++) {
            data.push(createTrace(getData(trace[i]), type, traceName[i], fill));
        }
        Plotly.newPlot(plotId, data, layout, { displayModeBar: false });
    }
    createPlot("energy_share_plot", ["nuclear_share_energy", "renewables_share_energy", "fossil_share_energy"], {
        title: "Energy share by source",
        xaxis: { title: "year" },
        yaxis: { title: "energy share [%]" },
        paper_bgcolor: "rgba(255, 255, 255, 0)",
        plot_bgcolor: "rgba(255, 255, 255, 0)"
    }, "scatter", ["Nuclear share [%]", "Renewables share [%]", "Fossil share [%]"], null);
    createPlot("detailed_energy_share_plot", ["coal_share_energy", "oil_share_energy", "gas_share_energy", "nuclear_share_energy", "biofuel_share_energy", "hydro_share_energy", "solar_share_energy", "wind_share_energy", "other_renewables_share_energy"], {
        title: "Detailed energy share [%]",
        xaxis: { title: "year" },
        yaxis: { title: "energy share [%]" },
        paper_bgcolor: "rgba(255, 255, 255, 0)",
        plot_bgcolor: "rgba(255, 255, 255, 0)"
    }, "scatter", ["Coal share [%]", "Oil share [%]", "Gas share [%]", "Nuclear share [%]", "Biofuel share [%]", "Hydro share [%]", "Solar share [%]", "Wind share [%]", "Other renewables [%]"], null);
    createPlot("electricity_generation", ["primary_energy_consumption", "electricity_generation"], {
        title: "Electricity generation",
        xaxis: { title: "year" },
        yaxis: { title: "TWh" },
        paper_bgcolor: "rgba(255, 255, 255, 0)",
        plot_bgcolor: "rgba(255, 255, 255, 0)"
    }, "scatter", ["Primary energy consumption", "Electricity generation"], null);
    createPlot("carbon_plot", ["carbon_intensity_elec"], {
        title: "Greenhouse gas emisson intensity of electricity generation",
        xaxis: { title: "year" },
        yaxis: { title: "g CO2e / kWh" },
        paper_bgcolor: "rgba(255, 255, 255, 0)",
        plot_bgcolor: "rgba(255, 255, 255, 0)"
    }, "scatter", ["gdp [USD]"], "tozeroy");
    document.getElementById("country").innerText = countryName;
}
d3.json("https://raw.githubusercontent.com/piotrek124-1/Energy_map/main/countries.geojson").then(function (data) {
    var closeButton = document.getElementById("close_button");
    closeButton.addEventListener("click", function (d) { return click(); });
    var status = false;
    var mouseHoverStart = function (d) {
        if (status === false) {
            d3.selectAll(".Name")
                .transition()
                .duration(200)
                .style("opacity", 0.5);
            d3.select(this)
                .transition()
                .duration(400)
                .style("opacity", 1);
        }
    };
    var mouseHoverStop = function (d) {
        if (status === false) {
            d3.selectAll(".Name")
                .transition()
                .duration(200)
                .style("opacity", 1);
        }
    };
    var click = function () {
        if (status === false) {
            document.getElementById("close_button").style.visibility = "visible";
            d3.selectAll("svg")
                .transition()
                .duration(1000)
                .style("opacity", 0.15);
            getEnergyData(this.__data__.properties.name);
            status = true;
        }
        else {
            document.getElementById("close_button").style.visibility = "hidden";
            document.getElementById("country").innerHTML = null;
            document.getElementById("energy_share_plot").innerHTML = null;
            document.getElementById("detailed_energy_share_plot").innerHTML = null;
            document.getElementById("electricity_generation").innerHTML = null;
            document.getElementById("carbon_plot").innerHTML = null;
            d3.select("svg")
                .transition()
                .duration(1000)
                .style("opacity", 1);
            status = false;
        }
    };
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff").attr("class", function (d) {
        return "Name";
    })
        .style("opacity", 0.9)
        .on("mouseover", mouseHoverStart)
        .on("mouseleave", mouseHoverStop)
        .on("click", click);
});
