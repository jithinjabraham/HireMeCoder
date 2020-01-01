/*jshint esversion: 6 */
//This vue instance is used by the candidate's user interface 

var appVue = new Vue({
  el: "#app",

  data: {
    //name to display on top right corner
    displayName: "",

    //this var is used for question side navigation bar
    toggle: true,
    test:[],
    question: null,
    hasImg: false,

    //this variable shows the index of the current question
    currentIndex: 0,
    prevIndex: 0,
    currentType: "c_cpp",

    //store the responses in this array
    responses: [],

    //pointer to the editor
    editor: null,
    editorSessions: [],

    //this array contains all the language types the candidate can choose from and the syntax will be highlighted by the editor
    types: [{name:"C++", value:"c_cpp"},{name:"C#", value:"csharp"},{name:"Java", value:"java"},{name:"Python", value:"python"},{name:"Other", value:"text"}]
  },

  mounted: function() {
    this.loadEditor("c_cpp");
    this.getCandidateInfo();
    this.getQuestions();
  },

  watch: {
    currentIndex: function(){
      //get the previous question index, s.t. the responses can be stored correspondingly
      var ptrToData = this;
      this.test.forEach( function(q, i){
        if (q.question_id == ptrToData.question.question_id){
          ptrToData.prevIndex = i;
        }
      });
      this.updateResponse();
      this.updateCurrentQuestion();
    },

    //update the question's img variable
    question: function(){
      if (this.question.image != null){
        var extension = this.question.image.split(".").pop();
        this.hasImg = false;
        if (!(extension === "txt") && !(extension === "pdf"))
          this.hasImg = true;
      }
      else{
        this.hasImg = false;
      }
    }
  },

  methods: {
    //this function gets all the questions assigned to this candidate
    getQuestions: function(event) {
      
      // Create new AJAX request
      var xhttp = new XMLHttpRequest();

      // Handle response
      var ptrToData = this;
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var res = JSON.parse(xhttp.response);
          // save the questions to array
          ptrToData.test = res;
          ptrToData.question = res[0];

          //get previously saved responses
          ptrToData.getResponse();
        } else if (this.readyState == 4 && this.status == 401) {
          // Non admins cannot access the admin page, will be redirected to login page
          window.location.href = "/";
        }
      };

      // Open connection
      xhttp.open("GET", "/candidate/test.json", true);

      // Send request
      xhttp.send();
    },

    getResponse: function(event){
      // Create new AJAX request
      var xhttp = new XMLHttpRequest();

      // Handle response
      var ptrToData = this;
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var res = JSON.parse(xhttp.response);
          // First initialise responses
          ptrToData.initialiseResponses();

          //check if responses have been entered before in database
          if (res.test != null){
            if (res.test[0].response) {
              ptrToData.responses = res.test;
            }

            ptrToData.reloadSavedResponses();
          }
        } else if (this.readyState == 4 && this.status == 401) {
          // Non admins cannot access the admin page, will be redirected to login page
          window.location.href = "/";
        }
      };

      // Open connection
      xhttp.open("GET", "/candidate/responses.json", true);

      // Send request
      xhttp.send();
    },

    //this method sets up the responses array based on the question ids.
    initialiseResponses(){
      var EditSession = require("ace/edit_session").EditSession;
      ptrToData = this;
      this.test.forEach( function(question, index){
        var res = {question_id: question.question_id, response:{type:"c_cpp", body:"Type answer here."}};
        ptrToData.responses.push(res);

        //create an editor session for each question
        var editorSession = new EditSession("Type answer here.");
        ptrToData.editorSessions.push(editorSession);
      });

       // console.log("end init ");
       // console.log(ptrToData.responses);

    },

    // This is when we load candidate.html. So it only concerns he first question displayed only.
    reloadSavedResponses(){
      if (this.test.length > 0) {
        // console.log("In reload: ");
        // console.log(this.responses);
         this.editor.setSession(this.editorSessions[0]);
         this.editor.setValue(this.responses[0].response.body);
         this.currentType = this.responses[0].response.type;
         this.loadEditor(this.currentType);
      }
      // 
      // for (var i = 0; i < this.test.length; i++) {
      //   this.editor.setSession(this.editorSessions[i]);
      //  this.editor.setValue(this.responses[i].response.body);
      //  this.currentType = this.responses[i].response.type;
      //  this.loadEditor(this.currentType);
      // }
      // }
    },

    //initialise editor
    loadEditor(type){
      this.editor = ace.edit("editor");
      this.editor.setTheme("ace/theme/chrome");
      this.editor.getSession().setMode("ace/mode/" + type);
      this.editor.session.setTabSize(4);
    },

    //save the responses
    updateResponse(){
      this.responses[this.prevIndex].response.body = this.editor.getValue();
      this.responses[this.prevIndex].response.type = this.currentType;
      // console.log("prev index " + this.prevIndex);
      // console.log(this.responses[this.prevIndex]);
    },

    //update current question displayed on the screen
    updateCurrentQuestion(){
      //also update the current question      
      this.question = this.test[this.currentIndex];

      //update the editor to the new questions values
      this.editor.setSession(this.editorSessions[this.currentIndex]);
      this.editor.setValue(this.responses[this.currentIndex].response.body);

      //update the current response type and syntax highlighting
      this.currentType = this.responses[this.currentIndex].response.type;
      this.loadEditor(this.currentType);
    },

    //the following routes saves and submit the current responses for the questions
    save(){
      // Update current question's response before saving
      this.responses[this.currentIndex].response.body = this.editor.getValue();
      this.responses[this.currentIndex].response.type = this.currentType;

      // Create new AJAX request
      var xhttp = new XMLHttpRequest();

      // Handle response
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          alert("Saved");
        }
      };

      // Open connection
      xhttp.open("POST", "/candidate/saveTest", true);

      // Set content type to JSON
      xhttp.setRequestHeader("Content-type", "application/json")

      // Send request
      xhttp.send(JSON.stringify({response_arr : this.responses}));
    },

    submit(){
      // Update current question's response before saving
      this.responses[this.currentIndex].response.body = this.editor.getValue();
      this.responses[this.currentIndex].response.type = this.currentType;

      // Create new AJAX request
      var xhttp = new XMLHttpRequest();

      // Handle response
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          alert("Submitted");
          // redirect back to login page.
          window.location.href = "/";
        }
      };

      // Open connection
      xhttp.open("POST", "/candidate/submitTest", true);

      // Set content type to JSON
      xhttp.setRequestHeader("Content-type", "application/json")

      // Send request
      xhttp.send(JSON.stringify({response_arr : this.responses}));
    },

    //this route is used to get candidate info to display on the top right corner of page
    getCandidateInfo: function(event) {
      // Create new AJAX request
      var xhttp = new XMLHttpRequest();

      // Handle response
      var ptrToData = this;
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          // display the name of user
          var res = JSON.parse(xhttp.response);
          // console.log("INFO: " + res);
          var str = "Hi ";

          ptrToData.displayName = str.concat(res.name.first, ' ', res.name.last);
        } else if (this.readyState == 4 && this.status == 401) {
          // Non admins cannot access the admin page, will be redirected to login page
          window.location.href = "/";
        }
      };

      // Open connection
      xhttp.open("GET", "/candidate/info.json", true);

      // Send request
      xhttp.send();
    },

    //this route is used to send logout request and reroute to login page
    logout: function(event) {
      // Create new AJAX request
      var xhttp = new XMLHttpRequest();

      // Handle response
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          // redirect back to login page.
          window.location.href = "/";
        }
      };

      // Open connection
      xhttp.open("POST", "/logout", true);

      // Send request
      xhttp.send();
    },

    // toggleType(){
    //   $('.dropdown-toggle').dropdown();
    // },

    //the following method opens and closes the question navigation bar
    toggleQuestionNav(){
      $('#sidebar').toggleClass('active');
    }
  }
});

