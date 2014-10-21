[![Build Status](https://travis-ci.org/kaerus-component/microTask.png)](https://travis-ci.org/kaerus-component/microTask)

# microTask - A best effort nextTick shim

## Synopsis
Defers a task to aid with asynchronous processing in a single threaded environment.


  - [microtask()](#microtasktaskfunctionargsarraycontextobject)

## microtask(task:Function, args:Array, context:Object)

  Execute task on next event loop / tick

  * param Functiontask - the function to call
  * param Arrayargs - array of arguments
  * param Objectcontext - task context

  Example: 
```js
   function myTask(a,b,c){
      console.log(a,b,c);
   }
   microtask(myTask,["hello","world","!"]);
   // 
   doSomethingElse();
   // ...after next event tick ... => "Hello world!"
```

