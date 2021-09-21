class ControlPoint{
    constructor(id, x_density, y_intensity, xPixel, yPixel) {
        this.id = id;
        this.xDensity = x_density;          //value in the range [0,1], depicted on the x axis
        this.yIntensity = y_intensity;      //value in the range [0,1], depicted on the y axis
        this.xPixel = xPixel;                    //x value on the screen, needed for drawing
        this.yPixel = yPixel;                    //y value on the screen, needed for drawing
    }

    //calculates the xPixel and yPixel values
    //calculateCoordinates(){        }

}

class TransferFunction{
    constructor(width, height, domElement, numControlPoints, numBins) {
        let that = this;
        this.numControlpoints = numControlPoints;
        this.numBins = numBins;

        this.svg = domElement
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        this.width = this.svg.node().getBoundingClientRect().width;
        this.height = this.svg.node().getBoundingClientRect().height;

        console.log(this.width + " - " + this.height);

        this.margin = {top: 30, right: 50, bottom: this.height / 4, left: 50};

        this.density_scale = d3.scaleLinear()
            .domain([0,1])
            .range([this.margin.left, this.width - this.margin.left - this.margin.right]);

        var intensity_scale = d3.scaleLinear()
            .domain([0,1])
            .range([this.height - this.margin.bottom - this.margin.top, this.margin.top]);

        // density histogram
        let dummy = [];
        for(let i = 0; i < numBins; i++){
            dummy.push(i);
        }
        let bins = d3.bin().thresholds(numBins)(dummy);
        this.histogram = this.svg.append("g")
            .attr("transform", function() {
                return "translate("+ 0 + "," + (that.height - that.margin.bottom - that.margin.top) + ")";
            })
            .selectAll("rect")
            .data(bins)
            .enter().append("rect");

        var density_axis = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + (this.height - this.margin.bottom - this.margin.top) + ")")
            .call(d3.axisBottom().scale(this.density_scale));

        var xAxisLabel = density_axis.append("text")
            .style("text-anchor", "middle")
            .attr("x", this.width/2 - this.margin.right)
            .attr("y", this.margin.top)
            .attr("fill", "white")
            .text("density");

        var intensity_axis = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + this.margin.left + ")")
            .call(d3.axisLeft().scale(intensity_scale));

        var yAxisLabel = intensity_axis.append("text")
            .style("text-anchor", "middle")
            .attr("y", -30)
            .attr("x", -(this.height - this.margin.bottom)/2 - this.margin.top)
            .attr("transform", "rotate(-90)")
            .attr("fill", "white")
            .text("intensity");

        //functions for transformations to range [0,1]
        this.density_transform = d3.scaleLinear()
            .domain([this.margin.left, this.width - this.margin.left - this.margin.right])
            .range([0,1]);

        var intensity_transform = d3.scaleLinear()
            .domain([this.height - this.margin.bottom - this.margin.top, this.margin.top])
            .range([0,1]);
        //

        var anchorPoint1 = {x: this.density_scale(0), y: intensity_scale(0)};
        var anchorPoint2 = {x: this.density_scale(1), y: intensity_scale(1)};

        //initial values for control points (R,G,B and opacity)
        var opacity_data = [];
        let o1 = new ControlPoint(0, 0.2, 0.1, this.density_scale(0.2), intensity_scale(0.1));
        let o2 = new ControlPoint(1, 0.4, 0.3, this.density_scale(0.4), intensity_scale(0.3));
        let o3 = new ControlPoint(2, 0.7, 0.6, this.density_scale(0.7), intensity_scale(0.6));
        opacity_data.push(o1);
        opacity_data.push(o2);
        opacity_data.push(o3);

        var red_data = [];
        let r1 = new ControlPoint(0, 0.2, 0.9, this.density_scale(0.2), intensity_scale(0.9));
        let r2 = new ControlPoint(1, 0.5, 0.8, this.density_scale(0.5), intensity_scale(0.8));
        let r3 = new ControlPoint(2, 0.8, 0.6, this.density_scale(0.8), intensity_scale(0.6));
        red_data.push(r1);
        red_data.push(r2);
        red_data.push(r3);

        var blue_data = [];
        let b1 = new ControlPoint(0, 0.1, 0.5, this.density_scale(0.1), intensity_scale(0.5));
        let b2 = new ControlPoint(1, 0.4, 0.1, this.density_scale(0.4), intensity_scale(0.1));
        let b3 = new ControlPoint(2, 0.7, 0.1, this.density_scale(0.7), intensity_scale(0.1));
        blue_data.push(b1);
        blue_data.push(b2);
        blue_data.push(b3);

        var green_data = [];
        let g1 = new ControlPoint(0, 0.3, 0.7, this.density_scale(0.3), intensity_scale(0.7));
        let g2 = new ControlPoint(1, 0.5, 0.4, this.density_scale(0.5), intensity_scale(0.4));
        let g3 = new ControlPoint(2, 0.9, 0.3, this.density_scale(0.9), intensity_scale(0.3));
        green_data.push(g1);
        green_data.push(g2);
        green_data.push(g3);

        var path = d3.line()
            .x(function(d) {
                return d.xPixel;
            })
            .y(function(d) {
                return d.yPixel;
            });

        //draw circles and lines for RGB and opacity data
        this.appendPath(path, opacity_data, "#ddd", "opacityLine");
        this.appendPath(path, red_data, "red", "redLine");
        this.appendPath(path, blue_data, "#44f", "blueLine");
        this.appendPath(path, green_data, "green", "greenLine");

        this.appendControlPoints(path, opacity_data, "#ddd", ".opacityLine", this.density_transform, intensity_transform, anchorPoint1, anchorPoint2);
        this.appendControlPoints(path, red_data, "red", ".redLine", this.density_transform, intensity_transform, anchorPoint1, anchorPoint2);
        this.appendControlPoints(path, blue_data, "#44f", ".blueLine", this.density_transform, intensity_transform, anchorPoint1, anchorPoint2);
        this.appendControlPoints(path, green_data, "green", ".greenLine", this.density_transform, intensity_transform, anchorPoint1, anchorPoint2);


    }

    setHistogramData(data, exp){
        let that = this;

        let bins = d3.bin()
            .domain([0.0, 1.0])
            .thresholds(this.numBins)(data);

        console.log(bins);

        let max = d3.max(bins, d => d.length);
        let valueRange = [0, max];

        //let yRange = [this.height - this.margin.bottom, this.margin.bottom];
        let yRange = [this.margin.bottom, 0];
        let y = d3.scalePow()
            .exponent(exp)
            .domain(valueRange).nice()
            .range(yRange);

        let color = d3.scalePow()
            .exponent(exp)
            .domain(valueRange)
            .range(["#fee8c8", "#e34a33"])
            .interpolate(d3.interpolateHcl);

        let len = function(d){ return y(0) - y(d.length); }

        this.histogram.data(bins)
            .join("rect")
            .transition().duration(500)
            .attr("x", d => that.density_scale(d.x0) + 1)
            .attr("width", d => Math.max(0, that.density_scale(d.x1) - that.density_scale(d.x0) - 1))
            .attr("y", d => y(max))
            .attr("height", d => len(d))
            .attr("fill", "#444"); //d => color(d.length)
    }

    //to draw a path between the control points of a channel (RGB, opacity)
    appendPath(path, data, color, def){
        this.svg
            .append("path")
            .attr("class", def)
            .attr("d", path(data))
            .attr("stroke", color)
            .attr("fill", "none");
    }

    //to draw the control points as circles
    //every control point can be dragged to a new location
    //the path is updated accordingly
    appendControlPoints(path, data, color, def, tfDensity, tfIntensity, aP1, aP2){
        this.svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", function(d) {return d.xPixel;})
            .attr("cy", function(d) {return d.yPixel;})
            .attr("fill", color)
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

            //update the pixel coordinates
            var checked = check(event.x, event.y);

            d3.select(this)
                .attr("cx", d.xPixel = checked.x)
                .attr("cy", d.yPixel = checked.y);

            //update the density/intensity values
            d.xDensity = tfDensity(d.xPixel);
            d.yIntensity = tfIntensity(d.yPixel);

            d3.select("svg").select(def).attr("d", path(data));

        }

        function dragended(d) {
            d3.select(this).attr("stroke", null);
        }

        //make sure the control points stay in the axis coordinate space
        function check(x, y){

            let xCheck = x;
            let yCheck = y;

            if (x < aP1.x){ xCheck = aP1.x};
            if (x > aP2.x){ xCheck = aP2.x};

            if (y > aP1.y){ yCheck = aP1.y};
            if (y < aP2.y){ yCheck = aP2.y};

            return {x: xCheck, y: yCheck};


        }
    }






}

