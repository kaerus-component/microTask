
(function(root){
    "use strict"

    try {root = global} catch(e){ try {root = window} catch(e){} };

    var defer, deferred, observer, queue = [];
    
    if(root.process && typeof root.process.nextTick === 'function'){
        /* avoid buggy nodejs setImmediate */ 
        if(root.setImmediate && root.process.versions.node.split('.')[1] > '10') defer = root.setImmediate;
        else defer = root.process.nextTick;
    } else if(root.vertx && typeof root.vertx.runOnLoop === 'function') defer = root.vertx.RunOnLoop;
    else if(root.vertx && typeof root.vertx.runOnContext === 'function') defer = root.vertx.runOnContext;
    else if(observer = root.MutationObserver || root.WebKitMutationObserver) {
        defer = (function(document, observer, drain) {
            var el = document.createElement('div');
                new observer(drain).observe(el, { attributes: true });
                return function() { el.setAttribute('x', 'y'); };
        }(document, observer, drain));
    }
    else if(typeof root.setTimeout === 'function' && (root.ActiveXObject || !root.postMessage)) {
        /* use setTimeout to avoid buggy IE MessageChannel */
        defer = function(f){ root.setTimeout(f,0); }
    }
    else if(root.MessageChannel && typeof root.MessageChannel === 'function') {
        var fifo = [], channel = new root.MessageChannel();
        channel.port1.onmessage = function () { (fifo.shift())() };
        defer = function (f){ fifo[fifo.length] = f; channel.port2.postMessage(0); };
    } else throw new Error("No candidate for microTask defer()")

    deferred = head;

    function mikroTask(func,args){
        deferred(func,args);
    }

    function head(func,args){
        queue[queue.length] = [func,args]; 
        deferred = tail;
        defer(drain); 
    }

    function tail(func,args){
        queue[queue.length] = [func,args];
    }

    function drain(){      
        for(var i = 0; i < queue.length; i++){ queue[i][0].apply(null,queue[i][1]) }
        deferred = head;
        queue = [];
    }
    
    if(module && module.exports) module.exports = mikroTask;
    else if(typeof define ==='function' && define.amd) define(mikroTask); 
    else root.microTask = mikroTask;
}(this));