// ==============
// = Utilities =
// ==============

var add = function(a, b) { return a + b; }.future();
var sum = Function.dispatch(
  function(a) { return a; },
  function(a, b) { return add(a, b.first()); }
);

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

function $fixture(doc, fn) {
  fn.__doc = doc;
  fn.__istest = true;
  return fn;
}

function $doc(fn) { return fn.__doc; };
function $name(fn) { return fn.__name; };
function $origin(fn) { return fn._origin; };

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
          doc: origin.__doc,
          success: $P(),
          message: $P()
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

// =================
// = Async Support =
// =================

SSUnit.startAsync = function() {
  var caller = SSUnit.startAsync.caller;
  caller.__async = true;
  return caller.__result;
};

SSUnit.endAsync = function(hook) {
  hook.success.realize();
  hook.message.realize();
}.future();

// ==============
// = Assertions =
// ==============

SSUnit.assertGenerator = function(testFn, failMessageFn, arity) {
  return function assertFn() {
    var args = $A(arguments).head(arity),
        hook = (arguments.length > arity) ? $A(arguments).getLast() : null,
        success = (testFn.apply(this, args)) ? 1 : 0,
        result = (hook) ? hook : assertFn.caller.__result,
        old = result.success.value(false);
    if(old === null || old === undefined || old == 1) {
      result.success.deliver(success, false);
      if(!success) {
        failMessageFn.apply(this, [result.message].combine(args));
      } else {
        result.message.deliver("", false);
      }
    }
    return success == 1;
  };
};

SSUnit['assert'] = SSUnit.assertGenerator(
  $identity,
  function(msgp, a) { msgp.deliver([a, "is false-y"].join(" ") + ".", false); },
  1
);

SSUnit.assertFalse = SSUnit.assertGenerator(
  $identity.not(),
  function(msgp, a) { msgp.deliver([a, "is truth-y"].join(" ") + ".", false); },
  1
);

SSUnit.assertEqual = SSUnit.assertGenerator(
  function(a, b) { return a == b; },
  function(msgp, a, b) { msgp.deliver([a, "is not equal to", b].join(" ") + ".", false); },
  2
);

SSUnit.assertNotEqual = SSUnit.assertGenerator(
  function(a, b) { return a != b; },
  function(msgp, a, b) { msgp.deliver([a, "is equal to", b].join(" ") + ".", false); },
  2
);

SSUnit.assertThrows = SSUnit.assertGenerator(
  function(type, fn) {
    try {
      fn();
    } catch(err) {
      return (err instanceof type);
    }
    return false;
  },
  function(msgp, type) { msgp.deliver(["exception", (new type()).name || "Error", "not thrown"].join(" ") + ".", false); },
  2
);

// =======================
// = SSUnit.TestIterator =
// =======================

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
  run: function() { this.tests().each(Function.msg('run')); }
});

// ==========================
// = SSUnit.ResultsProducer =
// ==========================

SSUnit.ResultsProducer = new Class({
  name: "SSUnit.ResultsProducer",
  results: function() {
    var subTests = this.tests().map(Function.msg('results')),
        passed = sum.reduce(subTests.map(Function.acc('success'))),
        failed = passed.fn(function(n) { return subTests.length - n; }),
        success = passed.fn(function(n) { return n == subTests.length; }),
        message = $P();
    return {
      name: this.name,
      count: subTests.length,
      success: success,
      passed: passed,
      failed: failed,
      message: message,
      subTests: subTests
    };
  }
});

// ========================
// = SSUnitTest Singleton =
// ========================

var SSUnitTestClass = new Class({
  Implements: [Options, SSUnit.TestIterator, SSUnit.ResultsProducer],
  name: "SSUnitTest",

  defaults: {
    formatter: null
  },

  initialize: function(options) {
    this.setOptions(this.defaults, options);
    this.setFormatter(this.options.formatter);
    this.reset();
  },

  setFormatter: function(formatter) { this.__formatter = formatter; },
  formatter: function() { return this.__formatter; },
  
  main: function(options) {
    var f = (options) ? options.formatter : (this.formatter() || new SSUnitTest.ResultFormatter.Console),
        rs = this.tests().map(Function.msg('results'));
    if(f.options.supportsInteractive) rs.each(f.output.bind(f));
    this.run();
    if(!f.options.supportsInteractive) rs.each(f.output.bind(f));
  }
});
var SSUnitTest = new SSUnitTestClass();

// ==============
// = Exceptions =
// ==============

SSUnit.Error = new Class({
  Extends: SSException,
  Implements: SSExceptionPrinter,
  initialize: function(error, message) {
    this.parent(error);
    this.setMessage(message);
  },
  name: 'SSUnit.Error'
});

SSUnit.AssertError = new Class({
  Extends: SSUnit.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnit.AssertError'
});

SSUnit.AssertEqualError = new Class({
  Extends: SSUnit.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnit.AssertEqualError'
});

SSUnit.AssertNotEqualError = new Class({
  Extends: SSUnit.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnit.AssertNotEqualError'
});

SSUnit.AssertThrowsError = new Class({
  Extends: SSUnit.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnit.AssertThrowsError'
});

SSUnit.NoFormatter = new Class({
  Extends: SSUnit.Error,
  Implements: SSExceptionPrinter,
  name:'SSUnit.NoFormatter'
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
    this.__results = this.prepare(this.__testData);
    if(this.options.autoCollect) SSUnitTest.addTest(this);
  },
  
  prepare: function(results) {
    var passed = sum.reduce(results.map(Function.acc('success'))),
        failed = passed.fn(function(n) { return results.length - n; }),
        success = passed.fn(function(n) { return (n == results.length) ? 1 : 0; }),
        message = $P();
    return {
      name: this.name,
      count: results.length,
      success: success,
      passed: passed,
      failed: failed,
      message: message,
      subTests: results
    };
  },
  
  results: function() {
    return this.__results;
  },
  
  onStart: function () {},
  __onComplete__: function() { this.onComplete(); }.future(),
  onComplete: function() {},

  setup: function() {},
  tearDown: function() {},

  run: function() {
    this.onStart();
    this.__onComplete__.apply(this, this.__testData.map(Function.acc('success')));
    this.__testData.each(function(resultData) {
      var fn = resultData.fn,
          success = 1;
      
      try {
        this.setup();
      } catch(err) {
        console.error("Uncaught exception in setup.", err);
      }
      
      fn.__result = resultData;
      try {
        fn();
      } catch(err) {
        console.error("Uncaught exception in test", resultData.name, err);
        resultData.message.deliver(["uncaught exception", err, "in", resultData.name].join(" ")+".", false);
        success = 0;
      }

      var old = (resultData.success.value(false)) ? 1 : 0;
      resultData.success.deliver((old && success), !fn.__async);
      
      var message = resultData.message.value(false);
      if(!fn.__async) resultData.message.realize();
      
      try {
        this.tearDown();
      } catch(err) {
        console.error("Uncaught exception in tearDown", err);
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
    };
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
        failed: testResult.failed.value()
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
  
  initialize: function(options) {
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
    
    resultDiv.set('html', '<span><b class="testName"></b></span> <span class="doc"></span> <span class="status" style="color:green;"></span> <span class="message" style="color:green"></span> ...');
    
    var set = Element.set.future();
    resultDiv.getElement('.testName').set('text', testResult.name);
    resultDiv.getElement('.doc').set('text', testResult.doc || '');
    this.setStatusColor(resultDiv.getElement('.status'), testResult.success);
    this.setStatusText(resultDiv.getElement('.status'), testResult.success);
    this.setStatusColor(resultDiv.getElement('.message'), testResult.success);
    set(resultDiv.getElement('.message'), 'text', testResult.message);

    return resultDiv;
  },
  
  setStatusText: function(el, success) {
    el.set('text', (success) ? 'passed' : 'failed');
  }.future(),
  
  setStatusColor: function(el, success) {
    el.setStyle('color', (success) ? 'green' : 'red');
  }.future(),
  
  output: function(testResult, depth) {
    this.container().grab(this.format(testResult, depth));
    this.parent(testResult, depth);
    if(testResult.count) {
      this.totals(testResult, depth);
    }
  },
  
  totals: function(testResult, depth) {
    var totalsDiv = new Element('div', {
      'class': "SSTestResultTotals"
    });
    totalsDiv.setStyles({
      borderTop: '1px dashed black',
      marginLeft: 10*depth
    });
    
    totalsDiv.set('html', "Total test: <span class='count'></span>, Passed: <span class='passed'></span>, Failed: <span class='failed'></span>");
    
    var set = Element.set.future();
    totalsDiv.getElement('.count').set('text', testResult.count);
    set(totalsDiv.getElement('.passed'), 'text', testResult.passed);
    set(totalsDiv.getElement('.failed'), 'text', testResult.failed);

    this.container().grab(totalsDiv);
  }
});