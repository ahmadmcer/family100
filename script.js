var app = {
  // Variables
  version: 1,
  currentQ: 0,
  jsonFile:"json/animanga.json",
  board: $("<div class='gameBoard'>"+
             "<!--- Scores --->"+
             "<div class='score' id='boardScore'>0</div>"+
             "<div class='score' id='team1' >0</div>"+
             "<div class='score' id='team2' >0</div>"+

             "<!--- Question --->"+
             "<div class='questionHolder'>"+
               "<span class='question'></span>"+
             "</div>"+

             "<!--- Answers --->"+
             "<div class='colHolder'>"+
               "<div class='col1'></div>"+
               "<div class='col2'></div>"+
             "</div>"+

             "<!--- Buttons --->"+
             "<div class='btnHolder'>"+
               "<div id='awardTeam1' data-team='1' class='button'>Poin Tim 1</div>"+
               "<div id='wrongButton' class='button'>Salah</div>"+
               "<div id='newQuestion' class='button'>Selanjutnya</div>"+
               "<div id='awardTeam2' data-team='2'class='button'>Poin Tim 2</div>"+
             "</div>"+
           "</div>"),
  // Utility functions
  shuffle: function(array){
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  },
  jsonLoaded: function(data){
    console.clear()
    app.allData   = data
    app.questions = Object.keys(data)
    app.shuffle(app.questions)
    app.makeQuestion(app.currentQ)
    app.startMusic("aud/bgm.mp3")
    $('body').append(app.board)
  },

  // Action functions
  makeQuestion: function(qNum){
    var qText  = app.questions[qNum]
    var qAnswr = app.allData[qText]

    var qNum = qAnswr.length
        qNum = (qNum<8)? 8: qNum;
        qNum = (qNum % 2 != 0) ? qNum+1: qNum;
    
    var boardScore = app.board.find("#boardScore")
    var question   = app.board.find(".question")
    var col1       = app.board.find(".col1")
    var col2       = app.board.find(".col2")
    
    boardScore.html(0)
    question.html(qText.replace(/&x22;/gi,'"'))
    col1.empty()
    col2.empty()

    for (var i = 0; i < qNum; i++){
      var aLI
      var sound

      if (i == 0) {
        sound = "answer-1st"
      } else if (i == 1) {
        sound = "answer-2nd"
      } else if (i > 1 && i < 5) {
        sound = "answer-5"
      } else {
        sound = "answer"
      }

      if(qAnswr[i]){
        if (qAnswr[i][0].length >= 30) {
          aLI = $("<div class='cardHolder'>"+
                    "<div class='card "+sound+"'>"+
                      "<div class='front'>"+
                        "<span class='DBG'>"+(i+1)+"</span>"+
                      "</div>"+
                      "<div class='back DBG'>"+
                        "<span class='small'>"+qAnswr[i][0]+"</span>"+
                        "<b class='LBG'>"+qAnswr[i][1]+"</b>"+
                      "</div>"+
                    "</div>"+
                  "</div>")
        } else {
          aLI = $("<div class='cardHolder'>"+
                    "<div class='card "+sound+"'>"+
                      "<div class='front'>"+
                        "<span class='DBG'>"+(i+1)+"</span>"+
                      "</div>"+
                      "<div class='back DBG'>"+
                        "<span>"+qAnswr[i][0]+"</span>"+
                        "<b class='LBG'>"+qAnswr[i][1]+"</b>"+
                      "</div>"+
                    "</div>"+
                  "</div>")
        }
      } else {
        aLI = $("<div class='cardHolder empty'><div></div></div>")
      }
      var parentDiv = (i<(qNum/2))? col1: col2;
      $(aLI).appendTo(parentDiv)
    }  
    
    var cardHolders = app.board.find('.cardHolder')
    var cards       = app.board.find('.card')
    var backs       = app.board.find('.back')
    var cardSides   = app.board.find('.card>div')

    TweenLite.set(cardHolders , {perspective:800});
    TweenLite.set(cards       , {transformStyle:"preserve-3d"});
    TweenLite.set(backs       , {rotationX:180});
    TweenLite.set(cardSides   , {backfaceVisibility:"hidden"});

    cards.data("flipped", false)
    
    function showCard(){
      var card = $('.card', this)
      var flipped = $(card).data("flipped")
      var cardRotate = (flipped)?0:-180;
      TweenLite.to(card, 1, {rotationX:cardRotate, ease:Back.easeOut})
      flipped = !flipped
      $(card).data("flipped", flipped)
      app.getBoardScore()

      if (flipped) {
        if ($(card).hasClass("answer-1st")) {
          app.startSound("aud/answer-1st.wav");
        } else if ($(card).hasClass("answer-2nd")) {
          app.startSound("aud/answer-2nd.wav");
        } else if ($(card).hasClass("answer-5")) {
          app.startSound("aud/answer-5.wav");
        } else {
          app.startSound("aud/answer.wav");
        }
      }
    }
    cardHolders.on('click',showCard)
  },
  getBoardScore: function(){
    var cards = app.board.find('.card')
    var boardScore = app.board.find('#boardScore')
    var currentScore = {var: boardScore.html()}
    var score = 0
    function tallyScore(){
      if($(this).data("flipped")){
         var value = $(this).find("b").html()
         score += parseInt(value)
      }
    }
    $.each(cards, tallyScore)      
    TweenMax.to(currentScore, 1, {
      var: score, 
      onUpdate: function () {
        boardScore.html(Math.round(currentScore.var));
      },
      ease: Power3.easeOut,
    });
  },
  awardPoints: function(num){
    var num          = $(this).attr("data-team")
    var boardScore   = app.board.find('#boardScore')
    var currentScore = {var: parseInt(boardScore.html())}
    var team         = app.board.find("#team"+num)
    var teamScore    = {var: parseInt(team.html())}
    var teamScoreUpdated = (teamScore.var + currentScore.var)
    TweenMax.to(teamScore, 1, {
      var: teamScoreUpdated, 
      onUpdate: function () {
        team.html(Math.round(teamScore.var));
      },
      ease: Power3.easeOut,
    });
    
    TweenMax.to(currentScore, 1, {
      var: 0, 
      onUpdate: function () {
        boardScore.html(Math.round(currentScore.var));
      },
      ease: Power3.easeOut,
    });
    app.startSound("aud/award.wav");
  },
  changeQuestion: function(){
    app.currentQ++
    app.makeQuestion(app.currentQ)
    app.startSound("aud/turn-slide.wav");
  },
  wrongQuestion: function(){
    app.startSound("aud/wrong.wav");
  },

  // Inital function
  init: function(){
    $.getJSON(app.jsonFile, app.jsonLoaded)
    app.board.find('#newQuestion' ).on('click', app.changeQuestion)
    app.board.find('#awardTeam1'  ).on('click', app.awardPoints)
    app.board.find('#awardTeam2'  ).on('click', app.awardPoints)
    app.board.find('#wrongButton' ).on('click', app.wrongQuestion)
  },

  // Background Music
  startMusic: function(path){
    var audio = new Audio(path);
    audio.loop = true;
    audio.volume = 0.1;
    
    // Wait for user interaction before playing the music
    document.addEventListener('click', function() {
      audio.play();
    });
  },
  // Background Sound
  startSound: function(path){
    var audio = new Audio(path);
    audio.play();
  }
}

app.init()