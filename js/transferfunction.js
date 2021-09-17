class TransferFunction{
    constructor(width, height, domElement, numControlPoints) {
        this.width = width;
        this.height = height;
        this.numControlpoints = numControlPoints;

        this.svg = domElement
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        var margin = {top: 30, right: 50, bottom: 20, left: 50};

        var data = [
            {id: 0, x: 0.2, y: 0.1},
            {id: 1, x: 0.4, y: 0.3},
            {id: 2, x: 0.7, y: 0.6}
        ];

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
            .attr("x", width/2 - margin.right)
            .attr("y", margin.top)
            .attr("fill", "white")
            .text("density");

        var intensity_axis = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + ")")
            .call(d3.axisLeft().scale(intensity_scale));

        var yAxisLabel = intensity_axis.append("text")
            .style("text-anchor", "middle")
            .attr("y", -30)
            .attr("x", -height/2 - margin.top)
            .attr("transform", "rotate(-90)")
            .attr("fill", "white")
            .text("intensity");

        var p = d3.line()
            .x(function(d) {
                return density_scale(d.x);
            })
            .y(function(d) {
                return intensity_scale(d.y);
            });

        var updatedLine = d3.line()
            .x(function(d) {
                return d.x;
            })
            .y(function(d) {
                return d.y;
            });

       this.svg
            .append("path")
            .attr("class", "redLine")
            .attr("d", p(data))
            .attr("stroke", "red")
            .attr("fill", "none");

        this.svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", function(d) {return density_scale(d.x);})
            .attr("cy", function(d) {return intensity_scale(d.y);})
            .attr("fill", "red")
            .call(d3.drag()
                .subject(d3.select(this))
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );

        function dragstarted(event) {
            d3.select(this).raise().attr("stroke", "black");
        }

        function dragged(event, d) {
            d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
            d3.select("svg").select(".redLine").attr("d", updatedLine(data));
        }

        function dragended(d) {
            d3.select(this).attr("stroke", null);
        }



    }



}