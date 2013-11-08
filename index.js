
(function(root){
    "use strict"

    try {root = global} catch(e){ try {root = window} catch(e){} };

    var defer, tasks = [];
    
    if(root.process && typeof root.process.nextTick === 'function') defer = root.process.nextTick;
    else if(root.vertx && typeof root.vertx.runOnLoop === 'function') defer = root.vertx.RunOnLoop;
    else if(root.vertx && typeof root.vertx.runOnContext === 'function') defer = root.vertx.runOnContext;
    else if(observer = root.MutationObserver || root.WebKitMutationObserver) {
        defer = (function(doc, obs, drain) {
            var el = doc.createElement('div');
            new obs(drain).observe(el, { attributes: true });
            return function() { el.setAttribute('x', 'y'); };
        }(document, root.MutationObserver, microTask.drain));
    }
    else if(typeof root.setTimeout === 'function' && (root.ActiveXObject || !root.postMessage)) {
        defer = function(f){ root.setTimeout(f,0); }
    }
    else if(root.MessageChannel && typeof root.MessageChannel === 'function') {
        var fifo = [], channel = new root.MessageChannel();
        channel.port1.onmessage = function () { (fifo.shift())() };
        defer = function (f){ fifo[fifo.length] = f; channel.port2.postMessage(0); };
    } else throw new Error("No candidate for microTask defer()")

    function microTask(t){
        if(tasks.push(t) === 1) defer(microTask.drain);
    }

    microTask.drain = function(){ 
        var t = tasks;
        tasks = [];

        for(var i = 0, l = t.length; i < l; i++) t[i]();
    }

    microTask.insert = function(t,p){
        p = p ? p : 0;
        tasks.splice(p,0,t);
    }

    microTask.has = function(t){
        return !(tasks.indexOf(t) < 0)
    }

    microTask.cancel = function(t){
        if(typeof t === 'function' && (t = tasks.indexOf(t)) < 0) return;
        else if(t == undefined) { tasks = []; return; } 

        return tasks.splice(t,1);
    }
    
    if(module && module.exports) module.exports = microTask;
    else if(typeof define ==='function' && define.amd) define(microTask); 
    else root.microTask = microTask;
}(this));
