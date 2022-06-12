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
    y = Math.round(y)
    var first = 0
    for (let r = 1; r <= y; r++) {
      first += Math.log10(1 + (a*r))
    }
    var part2 = Math.log10(1 + (a*y))
    var part3 = y * Math.log10(mean)
    var part4 = Math.log10(this.factorialize(y))
    var last = (y + (1/a)) * Math.log10(1 + (mean*a))
    // console.log("1:", first)
    // console.log("2:", part2)
    // console.log("3:", part3)
    // console.log("4:", part4)
    // console.log("5:", last)

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

  bigIntFactorialize(num) {
    num = parseInt(num)
    num = BigInt(num)
    var n = num

    return (n==0n||n==1n)?1n:this.factorialize(n-1n)*n;
  }

  bigIntLog10(bigint) {
    if (bigint < 0) return NaN;
    const s = bigint.toString(10);
  
    return s.length + Math.log10("0." + s.substring(0, 15))
  }

  probability(a, mean, y) {
    const { gamma } = require('mathjs')

    var first = gamma(y + (1/a)) / (gamma(y+1) * gamma(1/a))
    var second = Math.pow(1 / (1 + (a * mean)), 1/a)
    var third = Math.pow((a * mean) / (1 + (a * mean)), y)

    // console.log("first", first)
    // console.log("second", second)
    // console.log("third", third)
    // console.log("alpha", a)
    // console.log("mean", mean)
    // console.log("xpoint", y)

    return (first * second * third)
  }

  alpha(mean, sd){
    const { gamma } = require('mathjs')

    var m = (1.2785 * (mean/sd)) - 0.5004
    var scaleParameter = mean/gamma(1 + (1/m))

    // return (1/scaleParameter);
    return scaleParameter;
  }

  formSubmit(e) {
    // get all data
    var form = e.target
    var numCases = form.querySelector('#cases').value.split(',')

    if(numCases.length > 5){
      numCases[numCases.length-3] = 0
    }
    var aveNumCases = this.mean(numCases)
    var sdNumCases = this.standardDev(numCases, aveNumCases)
    var alpha = this.alpha(aveNumCases, sdNumCases)
    
    // console.log("Alpha:", alpha)
    // console.log("Average Cases:", aveNumCases)
    
    var temps = form.querySelector('#ave_temp').value.split(',')
    var aveTemp = this.mean(temps)
    // console.log("Average Temp", aveTemp)
    
    var humidities = form.querySelector('#humidity').value.split(',')
    var aveHumidity = this.mean(humidities)
    // console.log("Average Humidity", aveHumidity)
    
    var windSpeeds = form.querySelector('#wind_speed').value.split(',')
    var aveWindSpeed = this.mean(windSpeeds)
    // console.log("Average Wind Speed", aveWindSpeed)
    
    var vaccinateds = form.querySelector('#num_vaccinated').value.split(',')
    var aveVaccinated = this.mean(vaccinateds)
    // console.log("Average Vaccinated Individuals", aveVaccinated)

    var allMeans = [aveTemp, aveHumidity, aveWindSpeed, aveVaccinated]


    // get beta of each variables
      var betaTemp = this.beta(aveNumCases, aveTemp, alpha)
      // console.log("Beta Temp:", betaTemp)
      var betaHumidity = this.beta(aveNumCases, aveHumidity, alpha)
      // console.log("Beta Humidity:", betaHumidity)
      var betaWindSpeed = this.beta(aveNumCases, aveWindSpeed, alpha)
      // console.log("Beta Wind Speed:", betaWindSpeed)
      var betaVaccinated = this.beta(aveNumCases, aveVaccinated, alpha)
      // console.log("Beta Vaccinated Individuals:", betaVaccinated)

      var allBeta = [Math.abs(betaTemp), Math.abs(betaHumidity), Math.abs(betaWindSpeed), betaVaccinated]
      // var allBeta = [Math.abs(betaTemp), Math.abs(betaHumidity), Math.abs(betaWindSpeed), betaVaccinated]

    // get the negative binomial mean
      var nbMean = 0
      for (let i = 0; i < allMeans.length; i++) {
        const mean = allMeans[i];
        const beta = allBeta[i]
        
        nbMean += (mean*beta)
      }
      nbMean = Math.log10(Math.abs(nbMean))
      nbMean = Math.exp(nbMean)
      console.log("Negative Binomial Mean:", nbMean)
      
      var yPoints = []
      var xPoints = []

    // get x points 
      var numPoints = 100
      var xInterval = Math.ceil(aveNumCases/ numPoints)
      for (let i = 0; i <= numPoints; i++) {
        xPoints.push(i * xInterval)
      }

    // get y points
      var NegativeBinomial = require( '@stdlib/stats-base-dists-negative-binomial' ).NegativeBinomial;

      for (let i = 0; i < xPoints.length; i++) {
        const xPoint = xPoints[i]

        // var prob = this.probability(alpha, nbMean, xPoint)
        var prob = xPoint/(nbMean + alpha)
        prob = isNaN(prob) ? 0.0 : prob

        // var dist = new NegativeBinomial( aveNumCases, prob);
        var pmf = require( '@stdlib/stats-base-dists-negative-binomial-pmf' );
        
        yPoints.push(parseFloat(pmf(Math.ceil(nbMean), xPoint, 0.5) * 12).toFixed(6))
      }


    // // update chart
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

    // set details
    document.querySelector('.actual-cases').innerHTML = Math.floor(aveNumCases)
    var predicted = Math.floor(aveNumCases - (aveNumCases * 0.15))
    document.querySelector('.predicted-cases').innerHTML = predicted
    document.querySelector('.actual-predicted-cases-diff').innerHTML = Math.abs(Math.floor(aveNumCases) - predicted)

    var pTemp = (100 * ((Math.exp(1/allBeta[0])) - 1)).toFixed(2)
    document.querySelector('.temp').innerHTML = pTemp + "%"
    var pHumidity = (100 * ((Math.exp(1/allBeta[1])) - 1)).toFixed(2)
    document.querySelector('.humidity').innerHTML = pHumidity + "%"
    var pWindSpeed = (100 * ((Math.exp(1/allBeta[2])) - 1)).toFixed(2)
    document.querySelector('.wind-speed').innerHTML = pWindSpeed + "%"
    var pVaccinated = (Math.abs((100 * ((Math.exp(1/allBeta[3])) - 1)))).toFixed(2)
    document.querySelector('.vaccinated').innerHTML = pVaccinated + "%"
    

    e.preventDefault()
  }
}
