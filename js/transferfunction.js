class TransferFunction{
    constructor(width, height, domElement, numControlPoints) {
        this.width = width;
        this.height = height;
        this.numControlpoints = numControlPoints;

        this.svg = domElement
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        var margin = {top: 50, right: 20, bottom: 20, left: 50};

        var density_scale = d3.scaleLinear()
            .domain([0,1])
            .range([margin.left, width - margin.left - margin.right]);

        var intensity_scale = d3.scaleLinear()
            .domain([0,1])
            .range([height - margin.bottom - margin.top, margin.top]);

        var density_axis = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
            .call(d3.axisBottom().scale(density_scale));

        var xAxisLabel = density_axis.append("text")
            .style("text-anchor", "middle")
            .text("density");


        var intensity_axis = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + ")")
            .call(d3.axisLeft().scale(intensity_scale));



    }

}