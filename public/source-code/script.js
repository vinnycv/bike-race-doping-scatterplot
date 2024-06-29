const h = 600;
const w = 900;
const pad = {top: 100, right: 20, bottom: 30, left: 75};

// create svg area
const svg = d3.select('.container')
              .append('svg')
              .attr('height', h)
              .attr('width', w)
              .style('border', 'solid');

// create graph title
const graphTitle = svg.append('text')
                      .attr('id', 'title')
                      .text('Doping in Professional Bike Racing')
                      .style('font-size', '2rem')
                      // .style('text-align', 'center');
                      .style('transform', `translate(${w/4}px, 40px)`);
// graph subtitle
svg.append('text')
   .text('35 Fastest times up Alpe d\'Huez')
   .style('font-size', '1.5rem')
   .style('transform', `translate(${w/3}px, 70px)`);

// create y title
const yTitle = svg.append('text')
                  .text('Time (minutes)')
                  .style('transform', 
                         `translate(${pad.left/3}px, ${(h - pad.bottom)/2}px)
                         rotate(-90deg)`);

// create tooltip
const tooltip = d3.select('.container')
                  .append('div')
                  .attr('id', 'tooltip')
                  .style('opacity', 0);

// d3 color scale - gets mapped to true and false based on an empty string or not for doping allegations
const colors = d3.scaleOrdinal(d3.schemeCategory10);



// fetch data
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then((response) => {
  const dataset = response;
  
  const maxYear = d3.max(dataset, (d) => d.Year + 1); 
  // +1/-1 adds space on the x axis so no points are on the edges
  const minYear = d3.min(dataset, (d) => d.Year - 1);
  
  // create Dates with the times at 1970-1-1 to zero out everything but min and sec to handle the times ticks and to attach useful data attributes
  const timeParse = dataset.map((d) => d.Time.split(":"));
  const times = timeParse.map((d) => new Date(1970, 0, 1, 0, d[0], d[1], 0));
  
  
  //set x scale
  const xScale = d3.scaleLinear()
              .domain([minYear, maxYear])
              .range([pad.left, w - pad.left]);
  // create x axis 
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".4"));
              svg.append('g')
                 .call(xAxis)
                 .attr('id', 'x-axis')
                 .style('transform', `translate(0px, ${h - pad.bottom}px`);
  
  
  // set y scale
  const yScale = d3.scaleTime()
              .domain([d3.min(times), d3.max(times, (d) => d.setSeconds(d.getSeconds() + 15))])
              .range([pad.top, h - pad.bottom]);
  // create y axis
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));
              svg.append('g')
                 .call(yAxis)
                 .attr('id', 'y-axis')
                 .style('transform', `translate(${pad.left}px, 0`);
  
  // append circles
  svg.selectAll('circle')
     .data(dataset)
     .enter()
     .append('circle')
     .attr('cx', (d) => xScale(d.Year))
     .attr('cy', (d, i) => yScale(times[i]))
     .attr('r', 8)
     .attr('class', 'dot')
     .attr('data-xvalue', (d) => d.Year)
     .attr('data-yvalue', (d, i) => times[i])
     .style('fill', (d) => colors(d.Doping !== ''))
     .style('stroke-width', 1)
     .style('stroke', 'black')
     .style('opacity', 0.9)
     .attr('index', (d, i) => i)
     .on('mouseover', (event, d) => {
        const i = event.target.getAttribute('index');
        tooltip.transition().duration(0)
               .style('opacity', 0.8)
               .style('top', event.layerY + 'px')
               .style('left', event.layerX + 'px')
               .style('font-size', '0.9rem')
               .attr('data-year', d.Year);
        tooltip.html(
          d.Name + " - " + d.Nationality 
          + "<br>"
          + d.Year + " - Time: " + d.Time
          + (d.Doping ? "<br><br>" + d.Doping : "")
        );
  })
    .on('mouseout', (event) => {
      tooltip.style('opacity', 0);
  })
  
  // create legend
  const height = 68, width = 125, padding = 10, box = 18;
  const legend = svg.append('g')
        legend.append('rect')
                 .style('transform', `translate(${w - width - pad.right}px, ${h/2 - height}px)`)
                 .attr('id', 'legend')
                 .attr('width', width)
                 .attr('height', height)
                 .style('stroke-width', 1)
                 .style('stroke', 'black')
                 .style('fill', 'none');

  legend.append('rect')
        .attr('width', box)
        .attr('height', box)
        .attr('x', w - pad.right - box - padding)
        .attr('y', (d, i) => h/2 - (height - padding))
        .style('fill', (d) => colors(false));
  legend.append('rect')
        .attr('width', box)
        .attr('height', box)
        .attr('x', w - pad.right - box - padding)
        .attr('y', (d, i) => h/2 - height + box + (2*padding))
        .style('fill', (d) => colors(true));
  
  legend.append('text')
        .text('Non-doping')
        .style('transform', 
               `translate(
                  ${w - pad.right - width + padding}px, 
                  ${h/2 - height + 14 + padding}px)`
              );
  legend.append('text')
        .text('Doping')
        .style('transform', 
               `translate(
                  ${w - pad.right - width + padding}px, 
                  ${h/2 - height + 14 + (2*padding) + box}px)`
              );
  
}).catch(error => console.log(error));