window.vis = function (el, peers, events) {

  var format,
      color,
      bubble,
      svg;

  function init() {
    console.log('init');

    var diameter = 960;

    format = d3.format(",d");
    color = d3.scale.category20c();

    bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(2);

    svg = d3.select(el).append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .attr("class", "bubble");
  }

  function render() {
    var node = svg.selectAll(".node")
        .data(bubble.nodes(classes(peers))
        .filter(function(d) { return !d.children; }));

    node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.exit().remove();

    node.append("title")
        .text(function(d) { return d.id + ": " + format(d.value); });

    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return hashStringToColor(d.id); });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.id.substring(0, d.r / 3); });
  }

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(root) {
    var items = peers.map(function (p) {
      return { id: p.id, channel: 'channel-placeholder', value: 100 };
    });
    return { children: items };
  }

  return {
    init: init,
    render: render
  };
}


function djb2(str){
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}

function hashStringToColor(str) {
  var hash = djb2(str);
  var r = (hash & 0xFF0000) >> 16;
  var g = (hash & 0x00FF00) >> 8;
  var b = hash & 0x0000FF;
  return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
}