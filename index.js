
(function(root){
    "use strict";

    try {root = global;} catch(e){ try {root = window;} catch(e){} };

    var defer, observer, queue = [];
    
    if(root.process && typeof root.process.nextTick === 'function'){
        /* avoid buggy nodejs setImmediate */ 
        if(root.setImmediate && root.process.versions.node.split('.')[1] > '10') defer = root.setImmediate;
        else defer = root.process.nextTick;
    } else if(root.vertx && typeof root.vertx.runOnLoop === 'function') defer = root.vertx.RunOnLoop;
    else if(root.vertx && typeof root.vertx.runOnContext === 'function') defer = root.vertx.runOnContext;
    else if((observer = root.MutationObserver || root.WebKitMutationObserver)) {
        defer = (function(document, observer, drain) {
            var el = document.createElement('div');
            new observer(drain).observe(el, { attributes: true });
            return function() { el.setAttribute('x', 'y'); };
        }(document, observer, drain));
    }
    else if(typeof root.setTimeout === 'function' && (root.ActiveXObject || !root.postMessage)) {
        /* use setTimeout to avoid buggy IE MessageChannel */
        defer = function(f){ root.setTimeout(f,0); };
    }
    else if(root.MessageChannel && typeof root.MessageChannel === 'function') {
        var fifo = [], channel = new root.MessageChannel();
        channel.port1.onmessage = function () { (fifo.shift())(); };
        defer = function (f){ fifo[fifo.length] = f; channel.port2.postMessage(0); };
    } 
    else if(typeof root.setTimeout === 'function') defer = function(f){ root.setTimeout(f,0); }; 
    else throw new Error("no candidate for defer");

    var ql = 0;
    
    function microtask(func,args,ctx){
        queue[ql++] = [func,args,ctx];
	
	defer(drain);
    }

    function drain(){   
        var q;

        for(var i = 0; i < ql; i++){
            q = queue[i];
 	    q[0].apply(q[2],q[1]);
        }
	
        queue = [];
	ql = 0;
    }
    
    if(module && module.exports) module.exports = microtask;
    else if(typeof define ==='function' && define.amd) define(microtask); 
    else root.microtask = microtask;
}(this));
