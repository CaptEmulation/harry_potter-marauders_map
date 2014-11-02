
define(function (require) {
  var expect = require('chai').expect;
  var sinon = require('sinon');
  var mixins = require('mixins');
  
  describe('Mixins test suite', function () {

    Object.keys(mixins).forEach(function (key) {
      var C = mixins[key];
      it(sprintf('%s #constructor', C.$className), function () {
        expect(C.$create()).to.be.ok;
      });
    });
    
    describe('#SafelyCall', function () {
      var SafelyCall = mixins.SafelyCall;
      var sc;
      
      beforeEach(function () {
        sc = SafelyCall.$define('Test', {
          method: sinon.stub()
        }).$create();
      });
      
      it('Can call a method', function () {
        expect(sc.safelyCall.bind(sc, sc, 'method')).to.not.throw;
      });
      
      it('can safely not call a method', function () {
        expect(sc.safelyCall.bind(sc, sc, 'foo')).to.not.throw;
      });
    });
    
    
    
    describe('#Options', function () {
      var Options = mixins.Options;
      var o;
      
      beforeEach(function () {
        o = Options.$create().options();
      });
      
      describe('#expect', function () {
        it('will pass through a valid value', function () {
          o.expect('foo')
          expect(o.options({
            foo: 'bar'
          })).to.equal('bar');
        });
        
        it('will throw an exception on an invalid value', function () {
          var dsl = o.options({});
          expect(function () {
            o.foo;
          }).to.throw('Expect');
        });
        
        it('does fine with undefined options', function () {
          var dsl = o.options(undefined);
          expect(function () {
            o.foo;
          }).to.throw('Undefined');
        });
        
        it('double wrap will return self', function () {
          var dsl = o.options(Options.$create().options({
            'foo': 'bar'
          }));
          expect(dsl.foo).to.equal('bar');
        });
        
      });
      
      describe('#default', function () {
        it('Defaults on an empty object', function () {
          expect(o.options({}).default('foo', 'bar')).to.equal('bar');
        });
        
        it('Defaults on an undefined object', function () {
          expect(o.options(null).default('foo', 'bar')).to.equal('bar');
        });
        
        it('can use || logic for lazy-default', function () {
          expect(o.options(null).default('foo') || (function () {
            return 'bar';
          }())).to.equal('bar');
        });
      });
      
    });
  });
  
});
  
