var edge = require('edge');
var Rx = require('rx');

var subscribeFunc = edge.func(function () {/*
	async (dynamic input) => {
		Console.WriteLine(input.timestamp);
		return null;
	}
*/});

var createSubject = edge.func({
	source: function () {/*
		using System.Reactive.Linq;
		using System.Reactive.Subjects;

		async (dynamic input) => {
			var s = new Subject<object>();

			return new {
				subscribe = (Func<object,Task<object>>)(async (observer) => {
					s.Subscribe(x => {
						((Func<object,Task<object>>)observer)(x);
					});
					return null;					
				}),				
				onNext = (Func<object,Task<object>>)(async (data) => {
					s.OnNext((object)data);
					return null;
				})				
			};
		
		}
	*/},
	references: [
		__dirname + '\\System.Reactive.Core.dll',
		__dirname + '\\System.Reactive.Linq.dll',
		__dirname + '\\System.Reactive.Interfaces.dll',
		'System.Runtime.dll',
		'System.Threading.Tasks.dll'
	]
});

// var timer = Rx.Observable.timer(0, 500).timestamp();

// var subscription = timer.subscribe(function (x) {
// 	subscribeFunc(x, true);
// });

var MySubject = (function () {

	return function () {
		var subject = createSubject(null, true);

		var observer = Rx.Observer.create(function (x) {
			subject.onNext(x, true);
		});

		var observable = Rx.Observable.create(function (obs) {
			subject.subscribe(function (data, cb) {
				process.nextTick(function () {
					obs.onNext(data);
				});
				cb();
			});
		});

		return Rx.Subject.create(observer, observable);
	}

}());

var s = new MySubject();

s.subscribe(function (data) {
	console.log('Got data: ' + data);
});

Rx.Observable.timer(0, 500)
	.take(10)
	.subscribe(function (x) {
		s.onNext(x);
	});


console.log('Still alive');


