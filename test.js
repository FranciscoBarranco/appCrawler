var queue = require('queue')
 
var q = queue()
var results = []
 
// add jobs using the familiar Array API
// q.push(
//   function (ar) {
//     results.push('four')
//     ar();
//   },
//   function (ar) {
//     results.push('five')
//     ar(console.log('2'));
//   }
// )

q.push(function () {
  return new Promise(function (resolve, reject) {
    results.push('one')
    resolve()
  })
})

// begin processing, get notified on end / failure
q.start(function (err) {
  if (err) throw err
  console.log('all done:', results)
})