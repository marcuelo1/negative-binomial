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

  mean(data){
    return (data.reduce((a, b) => a + parseFloat(b), 0) / data.length) 
  }

  standardDev(data, mean){
    return Math.sqrt(data.map(x => Math.pow(parseFloat(x) - mean, 2)).reduce((a, b) => a + b) / data.length)
  }

  beta(y,mean,a){
    var first = 0
    for (let r = 1; r <= y; r++) {
      first += Math.log10(1 + (a*r))
    }
    var part2 = Math.log10(1 + (a*y))
    var part3 = y * Math.log10(mean)
    var part4 = Math.log10(this.factorialize(y))
    var last = (y + (1/a)) * Math.log10(1 + (mean*a))

    return (first - part2 + part3 - part4 - last)
  }

  factorialize(num) {
    if (num < 0) 
          return -1;
    else if (num == 0) 
        return 1;
    else {
        return (num * this.factorialize(num - 1));
    }
  }

  probability(a, mean, y) {
    const { gamma } = require('mathjs')

    var first = gamma(y + (1/a)) / (gamma(y+1) * gamma(1/a))
    var second = Math.pow(1 / (1 + (a * mean)), 1/a)
    var third = Math.pow((a * mean) / (1 + (a * mean)), y)

    return (first * second * third)
  }

  formSubmit(e) {
    // get all data
    var form = e.target
    var numCases = form.querySelector('#cases').value.split(',')
    var sumNumCases = numCases.reduce((a, b) => a + parseFloat(b), 0)
    console.log("Sum Of Num Cases", sumNumCases)
    
    var temps = form.querySelector('#ave_temp').value.split(',')
    var aveTemp = this.mean(temps)
    console.log("Average Temp", aveTemp)
    
    var humidities = form.querySelector('#humidity').value.split(',')
    var aveHumidity = this.mean(humidities)
    console.log("Average Humidity", aveHumidity)
    
    var windSpeeds = form.querySelector('#wind_speed').value.split(',')
    var aveWindSpeed = this.mean(windSpeeds)
    console.log("Average Wind Speed", aveWindSpeed)
    
    var vaccinateds = form.querySelector('#num_vaccinated').value.split(',')
    var aveVaccinated = this.mean(vaccinateds)
    console.log("Average Vaccinated Individuals", aveVaccinated)

    var allMeans = [aveTemp, aveHumidity, aveWindSpeed, aveVaccinated]

    // get alpha of each variables
    var sdTemp = this.standardDev(temps, aveTemp)
    console.log("Standard Dev Temp:", sdTemp)
    var sdHumidity = this.standardDev(humidities, aveHumidity)
    console.log("Standard Dev Humidity:", sdHumidity)
    var sdWindSpeed = this.standardDev(windSpeeds, aveWindSpeed)
    console.log("Standard Dev Wind Speed:", sdWindSpeed)
    var sdVaccinated = this.standardDev(vaccinateds, aveVaccinated)
    console.log("Standard Dev Vaccinated Individuals:", sdVaccinated)

    var allSd = [sdTemp, sdHumidity, sdWindSpeed, sdVaccinated]

    // get beta of each variables
    var betaIntercept = this.beta(0, 0, 1)
    console.log("Beta Intercept:", betaIntercept)
    var betaTemp = this.beta(sumNumCases, aveTemp, sdTemp)
    console.log("Beta Temp:", betaTemp)
    var betaHumidity = this.beta(sumNumCases, aveHumidity, sdHumidity)
    console.log("Beta Humidity:", betaHumidity)
    var betaWindSpeed = this.beta(sumNumCases, aveWindSpeed, sdWindSpeed)
    console.log("Beta Wind Speed:", betaWindSpeed)
    var betaVaccinated = this.beta(sumNumCases, aveVaccinated, sdVaccinated)
    console.log("Beta Vaccinated Individuals:", betaVaccinated)

    var allBeta = [betaTemp, betaHumidity, betaWindSpeed, betaVaccinated]

    // get the negative binomial mean
    var nbMean = 0
    for (let i = 0; i < allMeans.length; i++) {
      const mean = allMeans[i];
      const beta = allBeta[i]
      
      nbMean += (mean*beta)
    }
    nbMean = Math.exp(nbMean)
    console.log("Negative Binomial Mean:", nbMean)
    
    var yPoints = []
    var xPoints = []

    // get x points 
    var numPoints = 40
    var xInterval = Math.ceil(sumNumCases/ numPoints)
    for (let i = 0; i <= numPoints; i++) {
      xPoints.push(i * xInterval)
    }
    console.log('x points:', xPoints)

    // get y points
    // var NegativeBinomial = require( '@stdlib/stats-base-dists-negative-binomial' ).NegativeBinomial;
    // var dist = new NegativeBinomial( sumNumCases, 0.5 );

    for (let i = 0; i < xPoints.length; i++) {
      const xPoint = xPoints[i]

      var probTemp = this.probability(sdTemp, nbMean, xPoint)
      console.log("Probability Temp:", probTemp)

      var probHumidity = this.probability(sdHumidity, nbMean, xPoint)
      console.log("Probability Humidity:", probHumidity)

      var probWindSpeed = this.probability(sdWindSpeed, nbMean, xPoint)
      console.log("Probability Wind Speed:", probWindSpeed)

      var probVaccinated = this.probability(sdVaccinated, nbMean, xPoint)
      console.log("Probability Vaccinated Individuals:", probVaccinated)

      // yPoints.push(parseFloat((dist.pmf(xPoint)).toFixed(4)))
    }
    console.log('y points:', yPoints)


    // // update chart
    // var ctx = document.getElementById('myChart')
    // var chartContainer = document.querySelector('.data-container .chart')
    // ctx.remove()
    // chartContainer.innerHTML = "<canvas id='myChart'>"
    // ctx = document.getElementById('myChart').getContext('2d')

    // const labels = xPoints;
  
    // const data = {
    //   labels: labels,
    //   datasets: [{
    //     label: 'Negative Binomial',
    //     backgroundColor: 'rgb(255, 0, 0)',
    //     borderColor: 'rgb(255, 0, 0)',
    //     data: yPoints,
    //   }]
    // };
  
    // const config = {
    //   type: 'line',
    //   data: data,
    //   options: {
    //     responsive: true
    //   }
    // };

    // const myChart = new Chart(ctx, config);

    e.preventDefault()
  }
}
