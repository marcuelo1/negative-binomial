import { Controller } from "@hotwired/stimulus"
import Chart from 'chart.js/auto'

export default class extends Controller {
  connect() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = [];
  
    const data = {
      labels: labels,
      datasets: [{
        label: 'Negative Binomial',
        backgroundColor: 'rgb(255, 0, 0)',
        borderColor: 'rgb(255, 0, 0)',
        data: [],
      }]
    };
  
    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true
      }
    };

    const myChart = new Chart(ctx, config);
  }

  formSubmit(e) {
    // get all data
    var form = e.target
    var numCases = parseFloat(form.querySelector('#cases').value)
    var ave_temp = parseFloat(form.querySelector('#ave_temp').value)
    var humidity = parseFloat(form.querySelector('#humidity').value)
    var wind_speed = parseFloat(form.querySelector('#wind_speed').value)
    var density = parseFloat(form.querySelector('#density').value)
    var duration = parseFloat(form.querySelector('#duration').value)
    var population = parseFloat(form.querySelector('#population').value)

    // var rawData = [ave_temp, humidity, wind_speed, density, duration, population]
    // var sumOfData = rawData.reduce((a, b) => a + b, 0)
    var yPoints = []
    var xPoints = []

    // get x points 
    var numPoints = 40
    var xInterval = Math.ceil(numCases/ numPoints)
    for (let i = 0; i <= numPoints; i++) {
      xPoints.push(i * xInterval)
    }
    console.log('x points:', xPoints)

    // get y points
    var NegativeBinomial = require( '@stdlib/stats-base-dists-negative-binomial' ).NegativeBinomial;
    var dist = new NegativeBinomial( numCases, 0.5 );

    for (let i = 0; i < xPoints.length; i++) {
      const xPoint = xPoints[i]

      yPoints.push(parseFloat((dist.pmf(xPoint)).toFixed(4)))
    }
    console.log('y points:', yPoints)


    // update chart
    var ctx = document.getElementById('myChart')
    var chartContainer = document.querySelector('.data-container .chart')
    ctx.remove()
    chartContainer.innerHTML = "<canvas id='myChart'>"
    ctx = document.getElementById('myChart').getContext('2d')

    const labels = xPoints;
  
    const data = {
      labels: labels,
      datasets: [{
        label: 'Negative Binomial',
        backgroundColor: 'rgb(255, 0, 0)',
        borderColor: 'rgb(255, 0, 0)',
        data: yPoints,
      }]
    };
  
    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true
      }
    };

    const myChart = new Chart(ctx, config);

    e.preventDefault()
  }
}
