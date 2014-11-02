
define(function (require) {
  var expect = require('chai').expect;
  var sinon = require('sinon');
  var map = require('map');
  var sprintf = require('sprintf').sprintf;
  
  describe('Map test suite', function () {
    [map.MapModel, map.MapView, map.MapSectionModel, map.MapSectionView].forEach(function (C) {
      it(sprintf('%s #constructor', C.$className), function () {
        expect(C.$create()).to.be.ok;
      });
    });
  });
  
  describe('Backbone compatability tests', function () {
    describe('#Backbone.Model', function () {
      var model;
      
      beforeEach(function () {
        model = map.MapModel.$create({
          foo: 'bar'
        });
      });
      
      it ('has a #get', function () {
        expect(model.get('foo')).to.equal('bar');
      });
      
      it('can be #set', function () {
        model.set('foo', undefined);
        expect(model.get('foo')).to.not.be.ok;
        model.set('foo', 'bar');
        expect(model.get('foo')).to.equal('bar');
      });
      
      it('eventing works', function () {
        var stub = sinon.stub();
        model.on('change:foo', stub);
        model.set('foo', 'BAR');
        expect(stub.called).to.equal(true);
      });
    });
  });
  
  describe('(And now for the TDD)', function () {
    
    describe('#MapContainer', function () {
      var MapContainer = map.MapView.Container;
      it('#construct', function () {
        expect(MapContainer.$create()).to.be.ok;
      });
      
      it('#defineDirection', function () {
        var c = MapContainer.$create().defineDirection({
          direction: 'test'
        });
        expect(c.allowed()).to.contain('test');
        expect(Object.keys(c.views)).to.contain('test');
      });
      
      it('default add handler', function () {
        var c = MapContainer.$create().defineDirection({
          direction: 'test'
        });
        var obj = {};
        c.add({
          direction: 'test',
          data: obj
        });
        expect(c.views['test'][0]).to.contain(obj);
      });
    });
    
    describe('#HorizontalMapContainer', function () {
      var HorizontalMapContainer = map.MapView.HorizontalContainer;
      var container;
      
      beforeEach(function () {
        container = HorizontalMapContainer.$create();
      });
      it('#construct', function () {
        expect(container).to.be.ok;
      });
      
      it('default horizontal allowed', function () {
        expect(container.allowed()).to.contain('left').and.to.contain('right');
      });
      
      it('has custom add handler', function () {
        expect(container.add({
          direction: 'right',
          data: {
            url: 'foo'
          }
        }))
      });
    })
    
    describe('#MapView', function () {
      var view;
      beforeEach(function () {
        view = map.MapView.$create();
      });
      
      describe('has view stacks', function () {
        it('#viewStack', function () {
          expect(view.containerStack()).to.be.an('array');
        });
      });
      
      describe('#build', function () {
        
        it('add a horizontal container view stack', function () {
          view.build().horizontal();
          expect(view.containerStack().pop().allowed()).to.contain('left').and.to.contain('right');
        });
        
        describe('single right container', function () {
          var rightContainer, data;
          
          beforeEach(function () {
            data = {
              url: 'foo'
            };
            view.build().horizontal().addToTopContainer({
              direction: 'right',
              data: data
            });
            rightContainer = view.containerStack().pop();
          });
          
          it('adds a right view to right view stack', function () {
            expect(rightContainer.views['right'].pointer.$className).to.equal("MapSectionView");
          });
        });
        
        describe('4 containers', function () {
          var containerData;
          
          beforeEach(function () {
            containerData = [
              {
                left: {
                  background: {
                    url: 'url(left.0)'
                  },
                  width: 200,
                  height: 768
                },
                right: {
                  background: {
                    url: 'url(right.0)'
                  },
                  width: 200,
                  height: 768
                }
              },
              {
                left: {
                  background: {
                    url: 'url(left.1)'
                  },
                  width: 200,
                  height: 768
                },
                right: {
                  background: {
                    url: 'url(right.1)'
                  },
                  width: 200,
                  height: 768
                }
              }
            ];
          });
          
          var build = function () {
            return view.build()
              .horizontal(containerData[0])
              .horizontal(containerData[1]);
          }
          
          var expectStructure = function () {
            var stack = view.containerStack();
            expect(stack.length).to.equal(2);
            expect(view.$el);
            stack.forEach(function (container, index) {
              ['right', 'left'].forEach(function (dir) {
                expect(container.views[dir].pointer.$className).to.equal("MapSectionView");
                expect(container.views[dir].pointer.model.get('background').url).to.contain(sprintf('%s.%d', dir, index));
              });
              
              expect(container.views['left'].pointer.$className).to.equal("MapSectionView");
            });
          }
          
          it('#build long form', function () {
            view.build()
              .horizontal() // bottom container
                .addToTopContainer({
                  direction: 'right',
                  data: containerData[0].right
                })
                .addToTopContainer({
                  direction: 'left',
                  data: containerData[0].left
                })
              .horizontal() // top container
                .addToTopContainer({
                  direction: 'right',
                  data: containerData[1].right
                })
                .addToTopContainer({
                  direction: 'left',
                  data: containerData[1].left
                });
                
            expectStructure();
          })
          
          it('#build short form', function () {
            build();
            expectStructure();
          });
          
          describe('#open', function () {
            
            var stack;
            
            beforeEach(function () {
              build();
              stack = view.containerStack();
            });
            
            it('translates the top container elements', function () {
              view.open();
              expect(stack[0].views['right'].pointer.$el.css('transform')).to.include('translate(200px, 0px)');
              expect(stack[0].views['left'].pointer.$el.css('transform')).to.include('translate(-200px, 0px)');
            });
          });
          
          it('#render', function () {
            build();
            expect(view.render().$el.html()).to.include('map-section').and.to.include('right.0')
          });
        });
        
      });
    });
    
    describe('#MapSectionView', function () {
      var MapSectionView = map.MapSectionView;
      var MapSectionModel = map.MapSectionModel;
      var model, ms;
      
      beforeEach(function () {
        model = MapSectionModel.$create({
          background: {
            url: 'url(foo)',
          },
          width: 200,
          height: 100
        });
        ms = MapSectionView.$create({
          model: model
        });
      })
      it('Sets its image', function () {
        ms.render();
        expect(ms.$el.css('background-image')).to.include('foo');
        model.set('background', {
          url: 'url(bar)'
        });
        expect(ms.$el.css('background-image')).to.include('bar');
      });
      
      it('Sets the width', function () {
        ms.render();
        expect(ms.$el.css('width')).to.equal('200px');
      })
    });
  });
});
