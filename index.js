
(function(root){
    "use strict"

    try {root = global} catch(e){}

    var defer, observer, tasks = [];
    
    if(root.process && typeof root.process.nextTick === 'function') defer = root.process.nextTick;
    else if(root.vertx && typeof root.vertx.runOnLoop === 'function') defer = root.vertx.RunOnLoop;
    else if(root.vertx && typeof root.vertx.runOnContext === 'function') defer = root.vertx.runOnContext;
    else if(observer = root.MutationObserver || root.WebKitMutationObserver) {
        defer = (function(document, observer, drain) {
            var el = document.createElement('div');
                new observer(drain).observe(el, { attributes: true });
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
        for(var i = 0, l = tasks.length; i < l; i++) tasks[i]();
        tasks = []; 
    }

    microTask.insert = function(task,position){
        position = position ? position : 0;
        tasks.splice(position,0,task);
    }

    microTask.indexOf = function(task){ 
        return tasks.indexOf(task);
    } 

    microTask.has = function(task){
        return !(tasks.indexOf(task) < 0)
    }

    microTask.cancel = function(task){
        if(typeof task === 'function' && (task = tasks.indexOf(task)) < 0) return;
        else if(task == undefined) { tasks = []; return; } 

        return tasks.splice(task,1);
    }
    
    if(module && module.exports) module.exports = microTask;
    else if(typeof define ==='function' && define.amd) define(microTask); 
    else root.microTask = microTask;
}(this));
