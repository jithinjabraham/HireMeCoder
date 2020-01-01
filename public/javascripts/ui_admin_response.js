Vue.config.debug = true;
Vue.config.devtools = true;

function test(counter, type, body) {
  var editors = document.querySelectorAll(".editor");
  editor = ace.edit(editors[counter]);
  editor.setReadOnly(true);
  editor.getSession().setMode('ace/mode/'+ type);
  editor.session.setTabSize(4);
  editor.session.setValue(body);
}

Vue.component('response-display', {
  props: ['response', 'counter'],
  template: '<div>' + 
    '<h4>Question {{response.question_id}}</h4>' + 
    '<p><b>Response type:</b> {{response.response.type}}</p>' +
    '<p><b>Response:</b></p>' + 
    '<div class="editor"></div>' +
    '</div>',
  mounted: function() {
    test(this.response.question_counter, this.response.response.type, this.response.response.body);
  }
});

var appVue = new Vue({
  el: "#app",

  data: {
  	displayName: "",
  	candidates: [],
  	reviewedCandidates: [],
  	nonReviewedCandidates: [],

    // Varaiables for selected candidate
    selectedCandidateID: "",
    selectedCandidateName: "",
    selectedCandidateFeedback: "",
    selectedCandidateSavedTime: "",
    selectedCandidateSubmittedTime: "",
    selectedCandidateAllocatedEndTime: "",
    selectedCandidateResponses: [],

    //The following variables are used to get the account details for the new admin account.
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    seen: true,
    createAdminSuccess: false,
    createAdminErrors: [],

    //The following variables are for the Change Password function
    oldPassword: "",
    newPassword: "",
    changePasswordSuccess: false,
    changePasswordErrors: [],
    toggle: true,
  },

  mounted: function() {
      this.getURLParams();
      this.fillAdminPage();
      this.show_candidates();
      this.reviewTest(this.selectedCandidateID);
  },
  methods: {
    //This method is used to send the AJAX request to add the new admin account details to the database.
    createAdmin: function(event) {
      // Disable default form submission
      event.preventDefault();

      // Reset create admin errors
      appVue.createAdminErrors = [];

      // Create new AJAX request
      var xhttp = new XMLHttpRequest();
      // Define behaviour for a response
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          appVue.createAdminSuccess = true;
        } else if (this.readyState == 4 && this.status == 406) {
          appVue.createAdminSuccess = false;
          appVue.createAdminErrors.push("Email is already taken. Please choose another email.");
        } else if (this.readyState == 4 && this.status == 401) {
          appVue.createAdminSuccess = false;
          appVue.createAdminErrors.push("You're currently not logged in as admin. Please log in.");
        }else if (this.readyState == 4 && this.status != 200 && this.status != 406 && this.status != 401) {
          appVue.createAdminSuccess = false;
          appVue.createAdminErrors.push("There's an error creating an admin. Please try again.");
          console.log("Error: could not create an admin.");
        }
      };
      // Initiate connection
      xhttp.open("POST", "admin/admin", true);
      // Set content type to JSON
      xhttp.setRequestHeader("Content-type", "application/json");
      // Send request
      // 'this' keyword points to variables in the data section above.
      xhttp.send(JSON.stringify({
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        password: this.password
      }));
    },
    changePassword: function(event) {
      // Disable default form submission
      event.preventDefault();

      // Reset create admin errors
      appVue.changePasswordErrors = [];

      // Create new AJAX request
      var xhttp = new XMLHttpRequest();
      // Define behaviour for a response
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          appVue.changePasswordSuccess = true;
        } else if (this.readyState == 4 && (this.status == 500 || this.status == 403)) {
          appVue.changePasswordSuccess = false;
          appVue.changePasswordErrors.push("Cannot find admin in database / password incorrect.");
        } else if (this.readyState == 4 && this.status == 401) {
          appVue.changePasswordSuccess = false;
          appVue.changePasswordErrors.push("You're currently not logged in as admin. Please log in.");
        }else if (this.readyState == 4 && this.status != 200 && this.status != 403 && this.status != 401 ) {
          appVue.changePasswordSuccess = false;
          appVue.changePasswordErrors.push("There's an error changing your password. Please try again.");
          console.log("Error: could not create an admin.");
        }
      };
      // Initiate connection
      xhttp.open("POST", "admin/updatePassword", true);
      // Set content type to JSON
      xhttp.setRequestHeader("Content-type", "application/json");
      // Send request
      // 'this' keyword points to variables in the data section above.
      xhttp.send(JSON.stringify({
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      }));
    },
    getURLParams: function() {
      var paramstring = window.location.search;
      var p = paramstring.slice(paramstring.indexOf('?') + 1).split('&');
      var params = {};
      for (var i = 0; i < p.length; i++) {
        query = p[i].split('=');
        params[query[0]] = query[1];
      }
      var candidate_id = params.cid;
      this.selectedCandidateID = params.cid;
      console.log(this.selectedCandidateID);
    },

  	show_candidates: function(event){
  		//Create new AJAX request
  		var xhttp = new XMLHttpRequest();

  		//Define behaviour for a response
  		var ptrToData = this;
  		xhttp.onreadystatechange = function() {
  			if (this.readyState == 4 && this.status == 200) {
  				var res = JSON.parse(xhttp.response);
  				for(var i = 0; i < res.length; i++){
            var reviewable = false;
            var test_end_time = new Date(res[i].condition.test_end_time);
            var current_time = new Date();
            if (res[i].testCompleted == true || test_end_time < current_time) {
              reviewable = true;
            }
  					var candidate = {
  						"id": res[i]._id,
  						"firstname": res[i].name.first,
  						"lastname": res[i].name.last,
  						"email": res[i].email,
  						"status": res[i].testCompleted,
              "reviewable": reviewable
  					}
  					if (res[i].feedback) {
  						ptrToData.reviewedCandidates.push(candidate);
  					} else {
  						ptrToData.nonReviewedCandidates.push(candidate);
  					}
  				}
  			}
  			else if (this.readyState == 4 && this.status == 500) {
  				alert("Candidates are not in database")
  			}
      }

			//Initiate Connection
			xhttp.open("GET","admin/candidates.json",true);

			//Send request
			xhttp.send()

  	},

  	fillAdminPage: function(event) {
      // Create new AJAX request
      var xhttp = new XMLHttpRequest();

      // Handle response
      var ptrToData = this;
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          // display the name of user
          var res = JSON.parse(xhttp.response);
          var str = "Hi ";

          ptrToData.displayName = str.concat(res.name.first, ' ', res.name.last);
        } else if (this.readyState == 4 && this.status == 401) {
          // Non admins cannot access the admin page, will be redirected to login page
          window.location.href = "/admin_login.html";
        }
      };

      xhttp.open("GET", "/admin/info.json", true);
      xhttp.send();
      },

      //logout
      logout: function(event) {
        // Create new AJAX request
        var xhttp = new XMLHttpRequest();

        // Handle response
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            // redirect back to login page.
            window.location.href = "/admin_login.html";
          }
        };

        // Open connection
        xhttp.open("POST", "/logout", true);

        // Send request
        xhttp.send();
      },

      //reviewTest
      reviewTest: function(id){
        if (id) {
          console.log("in review test");
          var xhttp = new XMLHttpRequest();

          //Handle response
          xhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200){
              var res = JSON.parse(xhttp.response);
              appVue.selectedCandidateName = res.name.first + " " + res.name.last;
              appVue.selectedCandidateFeedback = res.feedback;
              if (res.lastSavedTime) {
                var date = new Date(res.lastSavedTime);
                appVue.selectedCandidateSavedTime = date.toUTCString();
              }
              if (res.lastSubmittedTime) {
                var date = new Date(res.lastSubmittedTime);
                appVue.selectedCandidateSubmittedTime = date.toUTCString();
              }
              if (res.condition.test_end_time) {
                var date = new Date(res.condition.test_end_time);
                appVue.selectedCandidateAllocatedEndTime = date.toUTCString();
              }

              var responses = [];
              for (var i = 0; i < res.test.length; i++) {
                var body = "";
                var type = "c_cpp"
                if (res.test[i].response) {
                  if (res.test[i].response.body) {
                    body = res.test[i].response.body;
                  }
                  if (res.test[i].response.body) {
                    type = res.test[i].response.type;
                  }
                }
                var response = {
                  question_id: res.test[i].question_id,
                  response: {
                    body: body,
                    type: type
                  },
                  question_counter: i
                }
                responses.push(response);
              }
              appVue.selectedCandidateResponses = responses;

              // Only redirect to feedback page if on candidate_response
              if (window.location.href == "http://localhost:3000/candidate_response.html") {
                window.location.href ="/feedback.html?cid="+id;
              }
            }
            // Direct back to responses page if forbiden (i.e. can't view uncompleted candidate's test)
            else if (this.readyState == 4 && this.status == 403) {
              window.location.href = "/candidate_response.html";
            }
            else if (this.readyState == 4 && this.status == 500) {
              window.location.href = "/candidate_response.html";
            }
            else if (this.readyState == 4 && this.status == 401) {
              window.location.href = "/admin_login.html";
            }
          };

          xhttp.open("GET", "/admin/responses.json?"+"cid="+id, true);
          xhttp.send();
        }
      },

     	//Saves response of feedback to database
      saveResponse: function(event){
        // Disable default form submission
        event.preventDefault();

      	var xhttp = new XMLHttpRequest();

      	xhttp.onreadystatechange = function() {
      		if (this.readyState == 4 && this.status == 200){
        		window.location.href = "candidate_response.html";
        	}
      	};

      	//Open Connection
      	xhttp.open("POST", "admin/feedback",true);

        // Set content type to JSON
        xhttp.setRequestHeader("Content-type", "application/json");
        
      	//Send request
      	xhttp.send(JSON.stringify({
          candidate_id: appVue.selectedCandidateID, 
          feedback: appVue.selectedCandidateFeedback
        }));

      }
  }
});