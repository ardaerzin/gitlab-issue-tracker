const getTimeString = (date) => {
  var hours = date.getHours()
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes()
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds()
  // return time in 10:30:23 format
  return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
}

module.exports = {
  getTimeString
}