// ==Builder==
// @optional
// @name              SSUnitTest
// @package           Testing
// @dependencies      SSException
// ==/Builder==

// ==============
// = Utilities =
// ==============

if(!Array.copy) {
  Array.implement({
    copy: function() {
      var results = [];
      for(var i = 0, l = this.length; i < l; i++) results[i] = this[i];
      return results;
    }
  });
}

if(!String.repeat) {
  String.implement({
    repeat: function(times) {
      var result = "";
      for(var i = 0; i < times; i++) result += this;
      return result;
    }
  });
}

function $deftest(doc, fn) {
  fn.__doc = doc;
  fn.__istest = true;
  return fn;
}

function $doc(fn) { return fn.__doc; };
function $name(fn) { return fn.__name; };
function $origin(fn) { return fn._origin };

function $processTest(test) {
  var testData = [];
  for(var field in test) {
    var v = test[field];
    if($type(v) == "function") {
      var origin = $origin(v);
      if(origin && origin.__istest) {
        v.__istest = true;
        v.__doc = origin.__doc;
        v.__name = field;
        origin.__name = field;
        testData.push({
          name: field,
          fn: origin,
          success: $lazy(),
          message: $lazy(),
        });
      }
    }
  }
  return testData;
}

// =============
// = NameSpace =
// =============

var SSUnit = {};

SSUnit.async = function() {
  var caller = SSUnit.async.caller;
  caller.__async = true;
  return caller.__result;
};

SSUnit.endAsync = function(hook) {
  hook.success.realize();
  hook.message.realize();
};

SSUnit.assertEqual = function(a, b, hook) {
  var success = (a == b) ? 1 : 0, message = "";
  var result = (hook) ? hook : SSUnit.assertEqual.caller.__result;
  var old = result.success.value(false);
  if(old === null || old === undefined || old == 1) {
    result.success.setValue(success, false);
    if(!success) result.message.setValue([a, "not equal to", b].join(" ") + ".", false);
  }
};

SSUnit.assertNotEqual = function(a, b, p) {
  var success = (a != b);
  var message = "";
  if(!success) {
    message = [a, "equal to", b].join(" ") + ".";
  }
  var caller = (p) ? p.meta().caller : SSUnit.assertEqual.caller;
  if(caller)
  {
    var lastValue = (p) ? p.value(false) : caller.__result; // if promise get the value, do not apply ops
    var newValue = {success:success, message: message};
    if(p) {
      if(lastValue === null || lastValue === true) {
        caller.__result.setValue(newValue, false); // set the value to false, do not trigger realized event
      }
    } else if(lastValue == null || lastValue === true) {
      caller.__result = newValue;
    }
  }
  return success;
};

/*
assertThrows: function(exceptionType, fn, args, hook) {
  if(arguments.length < 2) {
    throw new SSUnitTest.AssertThrowsError(new Error(), 'assertThrows expects at least 2 arguments.');
  }
  if(exceptionType == null) {
    throw new SSUnitTest.AssertThrowsError(new Error(), 'assertThrows exception type is null.');
  }
  
  // grab the remaining arguments
  var testArgs = $splat(args);
  var caller = $pick(hook, this.assertThrows.caller);
  
  try {
    fn.apply(null, testArgs);
    this.__setTestFail__(caller);
  }
  catch(err) {
    if(err instanceof exceptionType) {
      this.__setTestSuccess__(caller);
    } else {
      this.__setTestFail__(caller);
    }
  }
},

assert: function(value, hook) {
  if(arguments.length < 1) throw new SSUnitTest.AssertError(new Error(), 'assert expects 1 arguments.');
  var caller = $pick(hook, this.assert.caller);
  if(value == true) {
    this.__setTestSuccess__(caller);
  } else {
    this.__setTestFail__(caller);
  }
},

assertFalse: function(value, hook) {
  if(arguments.length < 1) throw new SSUnitTest.AssertError(new Error(), 'assertFalse expects 1 arguments.');
  var caller = $pick(hook, this.assertFalse.caller);
  if(value == false) {
    this.__setTestSuccess__(caller);
  } else {
    this.__setTestFail__(caller);
  }
}
*/

SSUnit.TestIterator = new Class({
  name: "SSUnit.TestIterator",

  setTests: function(tests) { this.__tests = tests; },

  tests: function() {
    if(!this.__tests) this.setTests([]);
    return this.__tests;
  },

  reset: function() { this.setTests([]); },

  addTest: function(aTest) {
    aTest = ($type(aTest) == 'class') ? new aTest({autoCollect:false}) : aTest;
    this.tests().push(aTest);
  },
  
  addTests: function(tests) { tests.each(this.addTests.bind(this)); },
  run: function() { this.tests().each($msg('run')); }
});


SSUnit.ResultsProducer = new Class({
  name: "SSUnit.ResultsProducer",
  results: function() {
    var subTests = this.tests().map($msg('results'));
    var passed = $reduce(sum, subTests.map($acc('success')));
    var failed = passed.fn(function(n) { return subTests.length - n; });
    var success = passed.fn(function(n) { return passed == subTests.length; });
    var message = $lazy();
    return {
      name: this.name,
      count: subTests.length,
      success: success,
      passed: passed,
      failed: failed,
      message: message,
      subTests: subTests
    }
  }
});

// ========================
// = SSUnitTest Singleton =
// ========================

var SSUnitTestClass = new Class({
  Implements: [Options, SSUnit.TestIterator, SSUnit.ResultsProducer],
  name: "SSUnitTest",

  defaults: {
    formatter: null,
  },

  initialize: function(options) {
    this.setOptions(this.defaults, options)
    this.setFormatter(this.options.formatter);
    this.reset();
  },

  setFormatter: function(formatter) { this.__formatter = formatter; },
  formatter: function() { return this.__formatter; },
  
  main: function(options) {
    var f = (options) ? options.formatter : (this.formatter() || new SSUnitTest.ResultFormatter.Console),
        rs = this.tests().map($msg('results'));
    if(f.options.supportsInteractive) rs.each(f.output.bind(f));
    this.run();
    if(!f.options.supportsInteractive) rs.each(f.output.bind(f));
  }
});
var SSUnitTest = new SSUnitTestClass()

// ==============
// = Exceptions =
// ==============

SSUnitTest.Error = new Class({
  Extends: SSException,
  Implements: SSExceptionPrinter,
  initialize: function(_error, message) {
    this.parent(_error);
    this.setMessage(message);
  },
  name: 'SSUnitTest.Error'
});

SSUnitTest.AssertError = new Class({
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnitTest.AssertError'
});

SSUnitTest.AssertEqualError = new Class({
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnitTest.AssertEqualError'
});

SSUnitTest.AssertNotEqualError = new Class({
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnitTest.AssertNotEqualError'
});

SSUnitTest.AssertThrowsError = new Class({
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnitTest.AssertThrowsError'
});

SSUnitTest.NoFormatter = new Class({
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnitTest.NoFormatter'
});

// =======================
// = SSUnitTest.TestCase =
// =======================

SSUnitTest.TestCase = new Class({
  
  Implements: [Options],
  name: 'SSUnitTest.TestCase',
  
  defaults: {
    autoCollect: true
  },
  
  initialize: function(options) {
    this.setOptions(this.defaults, options);
    this.__testData = $processTest(this);
    this.__results = this.prepare();
    if(this.options.autoCollect) SSUnitTest.addTest(this);
  },
  
  prepare: function() {
    var results = this.__testData;
    var passed = $reduce(sum, this.__testData.map($acc('success')));
    var failed = passed.fn(function(n) { return results.length - n; });
    var success = passed.fn(function(n) { return (passed == results.length) ? 1 : 0; });
    var message = $lazy();
    return {
      name: this.name,
      count: results.length,
      success: success,
      passed: passed,
      failed: failed,
      message: message,
      subTests: results
    }
  },
  
  results: function() {
    return this.__results;
  },
  
  setup: function() {},
  tearDown: function() {},

  run: function() {
    this.__testData.each(function(resultData) {
      var fn = resultData.fn;
      var success = 1;
      
      try {
        this.setup();
      } catch(err) {
        throw new SSUnitTest.Error(err, "Uncaught exception in setup.");
      }
      
      fn.__result = resultData;
      try {
        fn();
      } catch(err) {
        message = "uncaught exception: " + SSDescribeException(err);
        success = 0;
      } 

      var old = resultData.success.value(false);
      resultData.success.setValue(old && success, !fn.__async);
      
      var message = resultData.message.value(false);
      if(!fn.__async) resultData.message.realize();
      
      try {
        this.tearDown();
      } catch(err) {
        throw new SSUnitTest.Error(err, "Uncaught exception in tearDwon.");
      }
    }.bind(this));
  }
});

// ========================
// = SSUnitTest.TestSuite =
// ========================

SSUnitTest.TestSuite = new Class({
  
  Implements: [Options, SSUnit.TestIterator, SSUnit.ResultsProducer],
  name: 'SSUnitTest.TestSuite',
  
  defaults: {
    autoCollect: true
  },
  
  initialize: function(options) {
    this.setOptions(this.defaults, options);
    if(this.options.autoCollect) SSUnitTest.addTest(this);
  }
  
});

// ==================================
// = SSUnitTest.ResultFormatter =
// ==================================

SSUnitTest.ResultFormatter = new Class({
  
  Implements: [Options],
  name: 'SSUnitTest.ResultFormatter',
  
  defaults: function() {
    return {
      supportsInteractive: false
    }
  },
  
  initialize: function(options) {
    this.setOptions(this.defaults(), options);
  },
  
  asString: function(testResult) {
    var resultString = [];
    resultString.push(testResult.name + ":");
    resultString.push(testResult.doc || '');
    resultString.push((testResult.success.value() && "PASS") || "FAIL");
    resultString.push(testResult.message.value() || "");
    if(testResult['error']) resultString.push(", error:" + testResult['error']);
    resultString.push("...");
    return resultString.join(" ");
  },
    
  format: function(aResult, depth) {},

  output: function(aResult, depth) {
    depth = (depth != null) ? depth : 0;
    var subResults = aResult.subTests;
    if(subResults && subResults.length > 0) {
      subResults.each(function(subResult) {
        this.output(subResult, depth+1);
      }.bind(this));
    }
  },
  
  totals: function(aResult) {}
});


SSUnitTest.ResultFormatter.Console = new Class({
  Extends: SSUnitTest.ResultFormatter,
  name: 'SSUnitTest.ResultFormatter.Console',
  
  output: function(testResult, depth) {
    console.log("  ".repeat(depth) + this.asString(testResult));
    // call parent, required for relaying depth of test
    this.parent(testResult, depth);
    this.totals(testResult, depth);
  },
  
  totals: function(testResult, depth) {
    if(testResult.count)
    {
      var totals = {
        count: testResult.count,
        passed: testResult.passed.value(),
        failed: testResult.failed.value(),
      };
    
      console.log("  ".repeat(depth) + '------------------------------------------');
      console.log("  ".repeat(depth) + '{count} tests, {passed} passed, {failed} failed.'.substitute(totals));
    }
  }
});


SSUnitTest.ResultFormatter.BasicDOM = new Class({
  
  Extends: SSUnitTest.ResultFormatter,
  name: 'SSUnitTest.ResultFormatter.BasicDOM',
  
  defaults: function() {
    return $merge(this.parent(), {
      supportsInteractive: true
    });
  },
  
  initialize: function(container) {
    this.parent(options);
    this.__container = ($type(this.options.container) == 'string') ? $(this.options.container) : this.options.container;
  },
  
  setContainer: function(aContainer) { this.__container = aContainer; },
  container: function() { return this.__container; },

  format: function(testResult, depth) {
    var resultDiv = new Element('div', {
      'class': 'SSUnitTestResult'
    });
    resultDiv.setStyles({
      marginLeft: 10*depth
    });
    
    var testData = {
      testName: testResult.name,
      status: (testResult.success && 'passed') || 'failed',
      statusColor: (testResult.success && 'green') || 'red',
      doc: testResult.doc || '',
      message: testResult.message || ''
    };
    
    resultDiv.set('html', '<span><b class="testName"></b></span> <span class="doc"></span> <span class="status" style="color:green;"></span> <span class="message" style="color:green"></span> ...');
    
    var set = Element.set.asPromise();
    resultDiv.getElement('.testName').set('text', testResult.name);
    resultDiv.getElement('.doc').set('text', testResult.doc || '');
    this.setStatusColor(resultDiv.getElement('.status'), testResult.success);
    this.setStatusColor(resultDiv.getElement('.message'), testResult.success);
    set(resultDiv.getElement('.message'), 'text', testResult.message);

    return resultDiv;
  },
  
  setStatusColor: function(el, success) {
    el.setProperty('color', (success ) ? 'green' : 'red');
  }.asPromise(),

  output: function(testResult, depth) {
    this.container().grab(this.format(testResult, depth));
    this.parent(testResult, depth);
    if(testResult.count) {
      this.totals(testResult);
    }
  },
  
  totals: function(testResult) {
    var totalsDiv = new Element('div', {
      'class': "SSTestResultTotals"
    });
    totalsDiv.setStyles({
      borderTop: '1px dashed black'
    });
    
    totalsDiv.set('text', "Total test: <span class='count'></span>, Passed: <span class='passed'></span>, Failed: <span class='failed'></span>");
    
    var set = Element.set.asPromise();
    totalsDiv.getElement('.count').set('text', testResult.count);
    set(totalsDiv.getElement('.passed'), 'text', testResult.passed);
    set(totalsDiv.getElement('.failed'), 'text', testResult.failed);

    this.container().grab(totalsDiv);
  }
});