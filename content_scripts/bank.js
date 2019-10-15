(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
   if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function clean(){
    let children = document.body.childNodes;
    for(let i=0;i<children.length;i++){
      children[0].remove();
    }
  }
  /**
   * Listen for messages from the background script.
   */
   browser.runtime.onMessage.addListener((message) => {
    if (message.command === "go") {
      clean();
      start();
    }
  });


   var accounts = [];
   var transactions = [];
   var stop = true;
   var monthsLoaded = 0;
   var cssString = '*{ font-family: sans-serif; margin: 0; padding:0; text-align: center; } body{ background-color: whitesmoke; overflow: scroll; text-align: left; } #loadingDiv{ font-size: 1.1em; display: inline-block; border:1px solid black; margin: 5px; padding: 5px; } #loadingDiv:hover{ background-color: #9090DA; cursor: pointer; } #loadingMnd{ font-size: 1.1em; margin: 5px; padding: 5px; } #myProgress { width: 100%; background-color: #ddd; } #myProgress #loadingNumber{ right: 48%; } #myProgress p{ top: 1%; position: fixed; display: inline-block; right: 50%; } #myBar { width: 0%; height: 30px; background-color: #4CAF50; } #kontoDiv div,#yearDiv div,#monthDiv div{ font-size: 1.1em; display: inline-block; border:1px solid black; margin: 5px; padding: 5px; } tr td:first-child{ border-right: 1px solid grey; } #searchTable{ margin:auto; margin-top: 10px; font-size: 1.3em; width: 100%; } #searchTable .tekst{ font-size: 1em; } #searchTable .dato{ font-size: 0.8em; } #inputSearch{ width: 50%; margin: auto; font-size: 1.3em; } .clickedNodesP{ display: inline-block; margin-right: 5px; color:blue; } .top{ border-top: 1px solid black; } #transTable table{ width: 100%; border: 1px solid grey; } td{ padding: 3px; } tr,td,table{ border-collapse: collapse; } #monthSumTable tr,#monthSumTable td,#monthSumTable table{ border: 1px solid grey; } .kontoButton:hover,.yearButton:hover,.monthButton:hover{ background-color: #9090DA; cursor: pointer; } .clicked{ background-color: #9090DA; } #nav{ vertical-align: top; display: inline-block; width: 50%; box-sizing: border-box; } #transTable{ vertical-align: top; display: inline-block; width: 30%; box-sizing: border-box; margin: 10px; } #monthSumTable{ margin: 10px; vertical-align: top; display: inline-block; box-sizing: border-box; box-shadow: 10px 10px 5px grey; } .tekst{ font-size: 12px; text-align: left; } .beløp{ text-align: right; width: 80px; } .positive{ color: green; } .dato{ width: 80px; } .negative,#searchResult{ color: red; } input { display: block; font-size: 2em; width: 150px; } label{ display: block; font-size: 1em; text-align: center; } #login{ display: block; width: 50%; margin: auto; } #login p{ margin-top: 15px; margin-bottom: 0; } #login input{ text-align: left; font-size: 1.5em; -moz-appearance: textfield; -webkit-appearance: textfield; display: block; margin:auto; width: 200px; } #login button{ font-size: 2em; display: block; margin: auto; }';
   function cloneTheThing(){
    var functionCollection = {
      removeNode:removeNode,
      deleteChildren:deleteChildren,
      updateClicked:updateClicked,
      buildSearch:buildSearch,
      search:search,
      buildTransTable:buildTransTable,
      buildUniqueKonto:buildUniqueKonto,
      buildUniqueYear:buildUniqueYear,
      buildMonthsInYear:buildMonthsInYear,
      buildMonthSumTable:buildMonthSumTable,
      transArray:transArray,
      sumDaysInMonth:sumDaysInMonth,
      getDate:getDate,
      getMonth:getMonth,
      clearYearDivs:clearYearDivs,
      clearMonthDivs:clearMonthDivs,
      clearMonthSumTable:clearMonthSumTable,
      clearTransTable:clearTransTable,
      addClicked:addClicked,
      clearKontoClicked:clearKontoClicked,
      clearMonthClicked:clearMonthClicked,
      clearYearClicked:clearYearClicked,
      getYear:getYear,
      getMonthText:getMonthText,
      addZero:addZero,
      easyToReadNumbers:easyToReadNumbers,
      data:transactions,
      stopDataLoad:stopDataLoad
    };

    window.wrappedJSObject.functionCollection = cloneInto(
      functionCollection,
      window,
      {cloneFunctions: true});

  }


  function start(){
    var myNode = document.head;
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }
    document.head.insertAdjacentHTML('beforeend','<style type="text/css">'+cssString+'</style>');
    getAccs();
    var testAcc = accounts[0].number;
    loopYears(testAcc);
  }

  function stopDataLoad(){
    stop = false;
    testLoad = "";
  }

  function buildHTML(){
    var myNode = document.body;
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }
    document.body.insertAdjacentHTML('afterbegin',"<div id='transTable'></div><div id='nav'><div id='kontoDiv'></div>"
      +"<div id='yearDiv'></div><div id='monthDiv'></div><div id='search'></div></div><div id='monthSumTable'></div>")
    cloneTheThing();
    if(stop){
      document.body.insertAdjacentHTML('afterbegin','<div id="loadingDiv" onclick="window.functionCollection.stopDataLoad()">Stop lasting!</div><div id="loadingMnd">Måneder lastet: '+monthsLoaded+'</div>');
    }
    buildUniqueKonto(transactions);
  }

  function loopYears(accNumber){
    var dateNow = new Date(Date.now());
    var currentYear = dateNow.getFullYear();
    var currentMonth = dateNow.getMonth();
    if(currentMonth==0){
     /* currentMonth = 12;*/
      currentYear = currentYear-1;
    }
    var f = 0;
    while(stop && f<10){
      loopMonthsInYear(accNumber,12,currentYear-f);
      f++;
    }

  }

  function loopMonthsInYear(accNumber,startingMonth, year){
    for(y=startingMonth;y>0;y--){
      console.log("month: "+y);
      var fromDate = dateString(1,y,year);
      var toDate = dateString(daysInMonth(y,year),y,year);
      addTransactionsToArray(accNumber,fromDate,toDate);
    }
  }

  function getAccs(){
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function(){
      accounts = JSON.parse(this.response);
    });
    oReq.open("GET", "https://bank.flekkefjordsparebank.no/payment/transigo/json/accounts",false);
    oReq.send();
  }
  function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
  }

  function dateString(day,month,year){
    var dayString = day;
    if(day<10){
      dayString = "0"+day;
    }
    var monthString = month;
    if(month<10){
      monthString = "0"+month;
    }
    return dayString+"."+monthString+"."+year;
  }

  function addTransactionsToArray(accNumber, fromDate, toDate){
    var url = "https://bank.flekkefjordsparebank.no/dialogue"
    +"/transigo/archivesearch/transactions_search?accountno="+accNumber
    +"&group=0&to_account_transfer=&to_account_payment=&fromdate="
    +fromDate+"&todate="+toDate+"&fromamount=&toamount=&freetext=";
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("error",function(){
      console.error("Error occured");
    })
    oReq.addEventListener("load", function(){
      var htmlPage = new DOMParser().parseFromString(this.response, "text/html");

      /*var htmlPage = this.response;*/

      var htmlElement = htmlPage.childNodes[1];
      var bodyElement = htmlElement.childNodes[2];
      var bigTable = bodyElement.childNodes[17];
      var bigTableBody = bigTable.childNodes[1];
      var bigTableRow = bigTableBody.childNodes[0];
      var bigTableData = bigTableRow.childNodes[1];
      var realTable = bigTableData.childNodes[7];
      var realTableBody = realTable.childNodes[1];
      var realTableRows = realTableBody.children;

      /*4 første rader er bare beskrivelser etc*/
      for(i = 5;i<realTableRows.length;i++){

        /*leser data fra 3 celler i raden*/
        var tempRow = realTableRows[i];
        var tempDatoString = tempRow.children[0].innerText;
        var datoArr = tempDatoString.split(".");
        var americanDate = datoArr[1]+" "+datoArr[0]+" "+datoArr[2];
        var tempDato = Date.parse(americanDate);
        var tempString = tempRow.children[1].innerText;
        var cleanString = tempString.match(new RegExp(/([^\s]+)(.*)/));
        var amountUtenMellomrom = tempRow.children[2].innerText.replace(new RegExp(/\s/),"");
        var tempDouble = parseFloat(amountUtenMellomrom.replace(",","."));
        var tempObj = {dato:tempDato,konto:accNumber,tekst:cleanString[0],beløp:tempDouble};
        transactions.push(tempObj);
      }
      monthsLoaded++;
      buildHTML();
    });
    oReq.open("POST", url, false);
  //oReq.responseType = "document";
  oReq.ontimeout = function(){
    console.error("Timeout");
  }
  oReq.send();
};

function removeNode(node){
  if(node){
    node.parentNode.removeChild(node);
  }
}

function deleteChildren(node){
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
}
function updateClicked(){
  var nodes = document.getElementsByClassName("clicked");
  if (nodes.length>1) {
    var html = "<div id='clickedNodes'>"
    for (i = 1; i < nodes.length; i++) {
      html += "<p class='clickedNodesP'>"+nodes[i].innerHTML+"</p>";
    } 
    removeNode(document.getElementById("clickedNodes"));
    document.getElementById("search").insertAdjacentHTML('afterbegin',html+="</div>");
    return;
  }
  deleteChildren(document.getElementById("search"));
}
function buildSearch(){
  deleteChildren(document.getElementById("search"));
  document.getElementById("search").insertAdjacentHTML('beforeend',"<input id='inputSearch' placeholder='søk i valg'>")
  document.getElementById("inputSearch").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.key == "Enter") {
      var nodes = document.getElementsByClassName("clicked");
      var konto = nodes[0].innerHTML;
      var year = nodes[1].innerHTML;
      var string = document.getElementById("inputSearch").value.toLowerCase();
      if (nodes.length>2) {
        var month = nodes[2].getAttribute("data");
      } else {
        var month = false;
      }
      search(string,transactions,konto,year,month);
    }
  });
}
function search(input,object,konto,year,month){
  var html = "<table id='searchTable'>";
  var dateCheck = "";
  var inputArray = input.split("+");
  var sum = 0;
  for(j=0;j<inputArray.length;j++){
    for(var i in object){
      var tempKonto = object[i].konto;
      var tempString = object[i].tekst;
      var tempYear = getYear(object[i].dato);
      var tempMonth = getMonth(object[i].dato);
      var beløpClass = "negative";
      if(tempString.toLowerCase().indexOf(inputArray[j])>=0&&konto==tempKonto&&year==tempYear&&(month==tempMonth||typeof month === 'boolean')){
        if(object[i].beløp>0){
          beløpClass = "positive";
        }
        var tempDate = addZero(getDate(object[i].dato))+"."+addZero(getMonth(object[i].dato))+"."+getYear(object[i].dato);
        var topClass = "top";
        if (tempDate == dateCheck) {
          tempDate = "";
          topClass = "";
        } else {
          dateCheck = tempDate;
        }
        sum += object[i].beløp;
        html+="<tr><td class='dato "+topClass+"'>"+tempDate+"</td>"
        +"<td class='tekst "+topClass+"'>"+object[i].tekst+"</td>"
        +"<td class='"+beløpClass+" beløp "+topClass+"'>"+easyToReadNumbers(object[i].beløp)+"</td></tr>";
      }
    }
  }
  removeNode(document.getElementById("searchTable"));
  removeNode(document.getElementById("searchSum"));
  removeNode(document.getElementById("searchResult"));
  html+="</table>";
  var sumClass = "negative";
  if (sum>0) {
    sumClass = "positive";
  }
  if (html.length>32) {
    document.getElementById("inputSearch").insertAdjacentHTML('afterend',"<div id='searchSum'><p>sum av søket</p><p class='"+sumClass+"'>"+easyToReadNumbers(sum)+"</p></div>");
    document.getElementById("search").insertAdjacentHTML('beforeend',html);
  } else {
    document.getElementById("search").insertAdjacentHTML('beforeend',"<p id='searchResult'>søk fant ingenting</p>");
  }
}
function buildTransTable(object,konto,year,month){
  var html = "<table>";
  var dateCheck = "";
  for(var i in object){
    var tempKonto = object[i].konto
    var tempYear = getYear(object[i].dato);
    var tempMonth = getMonth(object[i].dato);
    var beløpClass = "negative";
    if(konto==tempKonto&&year==tempYear&&(month==tempMonth||typeof month === 'boolean')){
      if(object[i].beløp>0){
        beløpClass = "positive";
      }
      var tempDate = addZero(getDate(object[i].dato))+"."+addZero(getMonth(object[i].dato))+"."+getYear(object[i].dato);
      var topClass = "top";
      if (tempDate == dateCheck) {
        tempDate = "";
        topClass = "";
      } else {
        dateCheck = tempDate;
      }
      html+="<tr><td class='dato "+topClass+"'>"+tempDate+"</td>"
      +"<td class='tekst "+topClass+"'>"+object[i].tekst+"</td>"
      +"<td class='"+beløpClass+" beløp "+topClass+"'>"+easyToReadNumbers(object[i].beløp)+"</td></tr>";}
    }
    clearTransTable();
    document.getElementById("transTable").insertAdjacentHTML('afterbegin',html+="</table>");
  }
  function buildUniqueKonto(object){
    /*console.log(object.length);*/
    var tempArr = [];
    start:
    for(var j in object){
      /*console.log(j);*/
      var tempKonto = object[j].konto;
      for (var i = 0; i < tempArr.length; i++) {
        if (tempKonto==tempArr[i]) {
          continue start;
        }
      }
      tempArr.push(tempKonto);
    }
    var html="";
    for (var x = 0; x < tempArr.length; x++) {
      html+="<div id=\"kontoDiv"+x+"\" class=\"kontoButton\" onclick=\""
      +"window.functionCollection.clearKontoClicked()"
      +",window.functionCollection.addClicked('kontoDiv"+x+"')"
      +",window.functionCollection.buildUniqueYear(window.functionCollection.data,'"+tempArr[x]+"')"
      +",window.functionCollection.updateClicked()"
      +"\">"+tempArr[x]+"</div>";
    }
    var kontoDiv = document.getElementById("kontoDiv");
    while (kontoDiv.firstChild) {
      kontoDiv.removeChild(kontoDiv.firstChild);
    }
    //console.log(html);
    kontoDiv.insertAdjacentHTML('afterbegin',html);
  }
  function buildUniqueYear(object,konto){
    var tempArr = [];
    start:
    for(var j in object){
      var tempKonto = object[j].konto;
      if(konto==tempKonto){
        var tempYear = getYear(object[j].dato);
        for (var i = 0; i < tempArr.length; i++) {
          if (tempYear==tempArr[i]) {
            continue start;
          }
        }
        tempArr.push(tempYear);
      }
    }
    var html="";
    for (var x = 0; x < tempArr.length; x++) {
      html+="<div id=\"yearDiv"+x+"\" class=\"yearButton\" onclick=\""
      +"window.functionCollection.clearYearClicked()"
      +",window.functionCollection.addClicked('yearDiv"+x+"')"
      +",window.functionCollection.buildMonthSumTable(window.functionCollection.data,'"+konto+"','"+tempArr[x]+"')"
      +",window.functionCollection.buildTransTable(window.functionCollection.data,'"+konto+"','"+tempArr[x]+"',true)"
      +",window.functionCollection.buildMonthsInYear(window.functionCollection.data,'"+konto+"','"+tempArr[x]+"')"
      +",window.functionCollection.buildSearch()"
      +",window.functionCollection.updateClicked()"
      +"\">"+tempArr[x]+"</div>";
    }
    clearTransTable();
    clearMonthDivs();
    clearMonthSumTable();
    clearYearDivs();
    document.getElementById("yearDiv").insertAdjacentHTML('afterbegin',html);
  }


  function buildMonthsInYear(object,konto,year){
    var tempArr = [];
    start:
    for(var j in object){
      var tempKonto = object[j].konto;
      var tempYear = getYear(object[j].dato);
      if(konto==tempKonto&&year==tempYear){
        var tempMonth = getMonth(object[j].dato);
        for (var i = 0; i < tempArr.length; i++) {
          if (tempMonth==tempArr[i]) {
            continue start;
          }
        }
        tempArr.push(tempMonth);
      }
    }
    var html="";
    for (var x = 0; x < tempArr.length; x++) {
      html+="<div id=\"monthDiv"+x+"\" data='"+tempArr[x]+"' class='monthButton' onclick=\""
      +"window.functionCollection.clearMonthClicked()"
      +",window.functionCollection.addClicked('monthDiv"+x+"')"
      +",window.functionCollection.buildTransTable(window.functionCollection.data,'"+konto+"','"+year+"','"+tempArr[x]+"')"
      +",window.functionCollection.buildSearch()"
      +",window.functionCollection.updateClicked()"
      +"\">"+getMonthText(tempArr[x])+"</div>";
    }
    clearMonthDivs();
    document.getElementById("monthDiv").insertAdjacentHTML('afterbegin',html);
  }
  function buildMonthSumTable(object,konto,year){
    var tempArr = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];

    start:
    for(var j in object){
      var tempKonto = object[j].konto;
      var tempYear = getYear(object[j].dato);
      if(konto==tempKonto&&year==tempYear){
        var tempMonth = getMonth(object[j].dato);
        var beløp = object[j].beløp;
        if (beløp>0) {
          tempArr[tempMonth-1][0]+=beløp;
        } else {
          tempArr[tempMonth-1][1]+=beløp;
        }

      }
    }
    var html="<table>";
    for (var x = 0; x < tempArr.length; x++) {
      html+="<tr><td>"+getMonthText(x+1)+"</td><td class='positive'>"+easyToReadNumbers(tempArr[x][0])+"</td><td class='negative'>"+easyToReadNumbers(tempArr[x][1])+"</td></tr>"
    }
    clearMonthSumTable();
    document.getElementById("monthSumTable").insertAdjacentHTML('afterbegin',html+="</table>");
  }

    /*Returns array of arrays matching 3 variables*/
    function transArray(object,konto,year,month){
      var output = [];
      for(var i in object){
        if(konto==object[i].konto&&year==getYear(object[i].dato)&&month==getMonth(object[i].dato)){
          output.push([object[i].dato,object[i].konto,object[i].tekst,object[i].beløp]);
        }
      }
      return output;
    }

    /*Returns array with "beløp" sum of each day of the month*/
    function sumDaysInMonth(array,month,year){
      var output = [];
      output.length = new Date(year, month, 0).getDate();
      output.fill(0);

      for (var i = 0; i < array.length; i++) {
        /*var temp = getDate(array[][])*/
        output[getDate(array[i][0])]+=array[i][3];
      }
      return output;
    }

    function getDate(unixDate){
      return new Date(unixDate).getDate();
    }
    function getMonth(unixDate){
      return (new Date(unixDate).getMonth())+1;
    }
    function clearYearDivs(){
      var yearDiv = document.getElementById("yearDiv");
      while (yearDiv.firstChild) {
        yearDiv.removeChild(yearDiv.firstChild);
      }
    }
    function clearMonthDivs(){
      var monthDiv = document.getElementById("monthDiv");
      while (monthDiv.firstChild) {
        monthDiv.removeChild(monthDiv.firstChild);
      }
    }
    function clearMonthSumTable(){
      var monthSumTable = document.getElementById("monthSumTable");
      while (monthSumTable.firstChild) {
        monthSumTable.removeChild(monthSumTable.firstChild);
      }
    }
    function clearTransTable(){
      var transTable = document.getElementById("transTable");
      while (transTable.firstChild) {
        transTable.removeChild(transTable.firstChild);
      }
    }
    function addClicked(id){
      document.getElementById(id).classList.add("clicked");
    }
    function clearKontoClicked(){
      removeNode(document.getElementById("inputSearch"));
      var children = document.getElementById("kontoDiv").children;
      for (var i = 0; i < children.length; i++) {
        children[i].classList.remove("clicked");
      }
    }
    function clearMonthClicked(){
      var children = document.getElementById("monthDiv").children;
      for (var i = 0; i < children.length; i++) {
        children[i].classList.remove("clicked");
      }
    }
    function clearYearClicked(){
      var children = document.getElementById("yearDiv").children;
      for (var i = 0; i < children.length; i++) {
        children[i].classList.remove("clicked");
      }
    }
    function getYear(unixDate){
      return new Date(unixDate).getFullYear();
    }
    function getMonthText(monthNumber){
      var monthNames = ["Januar", "Februar", "Mars", "April", "Mai", "Juni","Juli", "August", "September", "Oktober", "November", "Desember"];
      return monthNames[monthNumber-1];
    }
    function addZero(int){
      if(int.valueOf()<10){
        return "0"+int.toString();
      } else {
        return int;
      }
    }
    function easyToReadNumbers(int){
      var temp = Math.round(int).toString();
      var lastIndex = temp.length-1;
      if(int>0){
        if(temp.length>3){
          return temp.substring(0,lastIndex-2)+" "+temp.substring(lastIndex-2);
        } else {
          return temp;
        }
      } else {
        if(temp.length>4){
          return temp.substring(0,lastIndex-2)+" "+temp.substring(lastIndex-2);
        } else {
          return temp;
        }
      }
    }


  })();
