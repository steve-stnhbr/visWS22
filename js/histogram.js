class HistogramSlider{
    constructor(width, height, margin, domain, initValue, domElement, numBins){
        this.width = width;
        this.height = height;
        this.data = null;
        this.domain = domain;
        this.initValue = initValue;

        this.xRange = [margin.left, width - margin.right];
        this.yRange = [height - margin.bottom, margin.top];
        this.x = null;
        this.y = null;

        console.log(domElement);

        this.svg = domElement
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.numBins = numBins;
        let dummy = [];
        for(let i = 0; i < numBins; i++){
            dummy.push(i);
        }
        let bins = d3.bin().thresholds(numBins)(dummy);
        this.histogram = this.svg.append("g")
            .selectAll("rect")
            .data(bins)
            .enter().append("rect");

        this.pointerX = 0;
        this.sliderX = 0;
        this.value = 0;

        let sliderMargin = ({top: 0, right: 3, bottom: 0, left: 3});
        this.sliderWidth = this.width / this.numBins + sliderMargin.left + sliderMargin.right;

        let drag = d3.drag()
            .on("start", event => this.#dragStarted(event))
            .on("drag", event => this.#dragging(event))
            .on("end", event => this.#dragStopped(event));

        this.slider = this.svg.append("rect")
            .attr("height", this.height + sliderMargin.top + sliderMargin.bottom)
            .attr("width", this.sliderWidth)
            .attr("x", -sliderMargin.left)
            .attr("y", -sliderMargin.top)
            .attr('stroke-width', '5')
            .attr('stroke', 'gray')
            .attr("fill", "white")
            .attr("fill-opacity", 0.5)
            .call(drag);
    }

    setData(data, exp){
        let that = this;

        let bins = d3.bin()
            .domain(this.domain)
            .thresholds(this.numBins)(data);

        let max = d3.max(bins, d => d.length);
        let valueRange = [0, max];

        this.x = d3.scaleLinear()
            .domain([bins[0].x0, bins[bins.length - 1].x1])
            .range(this.xRange);

        this.y = d3.scalePow()
            .exponent(exp)
            .domain(valueRange).nice()
            .range(this.yRange);

        let color = d3.scalePow()
            .exponent(exp)
            .domain(valueRange)
            .range(["#fee8c8", "#e34a33"])
            .interpolate(d3.interpolateHcl);

        let len = function(d){ return that.y(0) - that.y(d.length); }

        this.histogram.data(bins)
            .join("rect")
            .transition().duration(500)
            .attr("x", d => that.x(d.x0) + 1)
            .attr("width", d => Math.max(0, that.x(d.x1) - that.x(d.x0) - 1))
            .attr("y", d => (that.y(0) - that.y(max)) / 2 - len(d)/2)
            .attr("height", d => len(d))
            .attr("fill", d => color(d.length));
    }

    #dragStarted(event){
        console.log("STARTED");
        this.slider.attr("stroke", "red");
        this.pointerX = event.x;
    }
    #dragStopped(){
        console.log("stopped");
        this.slider.attr("stroke", "black");
    }

    #dragging(event){
        console.log(event.x);
        console.log(this.width);
        let xin = Math.min(Math.max(event.x, 0), this.width - this.sliderWidth);
        let dx = xin - this.pointerX;
        this.pointerX = xin;
        this.sliderX += dx;
        this.slider.attr("x", this.sliderX);
        this.value = this.x.invert(this.sliderX);
        console.log(this.value);
    }

    getSliderValue(){
        return this.value;
    }

    setSliderValue(value){
        //TODO
    }

}