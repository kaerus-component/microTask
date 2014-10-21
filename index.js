;(function(root){
    "use strict";

    try {root = global;} catch(e){ try {root = window;} catch(e){} };

    var defer, deferred, observer, queue = [];

    // Find best candidate for deferring a task 
    if(root.process && typeof root.process.nextTick === 'function'){
        // avoid buggy nodejs setImmediate in v0.10.x 
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
    } // avoid buggy IE MessageChannel
    else if(typeof root.setTimeout === 'function' && (root.ActiveXObject || !root.postMessage)) {
        defer = function(f){ root.setTimeout(f,0); };
    }
    else if(root.MessageChannel && typeof root.MessageChannel === 'function') {
        var fifo = [], channel = new root.MessageChannel();
        channel.port1.onmessage = function () { (fifo.shift())(); };
        defer = function (f){ fifo[fifo.length] = f; channel.port2.postMessage(0); };
    } 
    else if(typeof root.setTimeout === 'function') defer = function(f){ root.setTimeout(f,0); }; 
    else throw Error("no candidate for defer");

    deferred = head;

    /**
     * Execute task on next event loop / tick 
     *
     * Example: 
     *      function myTask(a,b,c){
     *         console.log(a,b,c);
     *      }
     *      microtask(myTask,["hello","world","!"]);
     *      // 
     *      doSomethingElse();
     *      // ...after next event tick ... => "Hello world!"
     *
     * @param {Function} task - the function to call
     * @param {Array} args - array of arguments
     * @param {Object} context - task context
     * @throws {Error} - task error
     * @api public
     */
    function microtask(func,args,context){

        if( typeof func !== 'function' )
	    throw Error("not a function");
        
        deferred(func,args,context);
    }

    function head(func,args,context){
        queue[queue.length] = [func,args,context]; 
        deferred = tail;
        defer(drain); 
    }

    function tail(func,args,context){
        queue[queue.length] = [func,args,context];
    }

    function drain(){   
        var q;

        for(var i = 0; i < queue.length; i++){
            q = queue[i];
            try {
                q[0].apply(q[2],q[1]);
            } catch(e) {
                defer(function() {
                    throw e;
                });
            }
        }
        deferred = head;
        queue = [];
    }
    
    if(module && module.exports) module.exports = microtask;
    else if(typeof define ==='function' && define.amd) define(microtask); 
    else root.microtask = microtask;
}(this));
