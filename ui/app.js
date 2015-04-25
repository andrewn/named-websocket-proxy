var peers   = [],
    events  = [],
    el = document.querySelector('#vis'),
    vis     = vis(el, peers, events),
    tracker = peerTracker(peers, events);

vis.init();

setInterval(vis.render.bind(this), 1000);