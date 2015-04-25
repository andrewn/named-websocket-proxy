var channels = [],
    events  = [],
    el = document.querySelector('#vis'),
    vis     = vis(el, channels, events),
    tracker = peerTracker(channels, events);

vis.init();

setInterval(vis.render.bind(this), 1000);