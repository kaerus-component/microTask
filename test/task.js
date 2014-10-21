/*global Promise, uPromise, require, describe, it*/

var task;

try{ task = uTask} catch(e) { task = require('..'); }


describe("microTask",function(){
    it("should be a function",function(){
	task.should.be.a.Function;
    });
});


