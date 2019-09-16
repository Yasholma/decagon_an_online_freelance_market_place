$(document).ready(function () {

    // Handling Sessions
    $("#logout").hide();
    $("#profile").hide();
    const userId = $.session.get('userId') != 0 ? $.session.get('userId') : 0;
    if (userId === undefined) {
        $("#logout").hide();
        $("#profile").hide();
        $("#signin").show();
        $("#signup").show();
    } else {
        $("#signin").hide();
        $("#signup").hide();
        $("#logout").show();
        $("#profile").show();
    }
    

    // Animating Navigation
    $(window).on('scroll', () => {
        if ($(window).scrollTop()) {
            $("nav").addClass("black");
        } else {
            $("nav").removeClass("black");
        }
    });

    // Load freelancers from the database on the homepage
    // https://picsum.photos/200/100
    axios.get("http://localhost:3000/Freelancers")
        .then(response => {
            const users = response.data;
            users.forEach(user => {
                $(".top-freelancers").append(
                    `
                    <div class='col-md-4'>
                        <div class="card mb-4">
                            <img class="card-img-top" src="" alt="">
                            <div class="card-body">
                                <h4 class="card-title"><i class="fas fa-user-circle"></i> ${user.name}</h4>
                                <p class="card-text"><i class="fas fa-envelope"></i> ${user.email}</p>
                                <p class="card-text"><strong>Skill:</strong> ${user.skill}</p>
                            </div>
                            <div class="card-footer">
                                <a href="view.html?id=${user.id}" class="btn btn-sm btn-outline-info float-right">View Profile</a>
                            </div>  
                        </div>
                    </div>
                    `
                );
            });
        })
        .catch(e => alert("Error loading data due to network issues"));


    // Registering a new freelancer
    $("#register").on('click', (e) => {
        e.preventDefault();

        let name = $("#name").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let skill = $("#skill").val();

        // Error feilds
        let nameError = $("#nameError");
        let emailError = $("#emailError");
        let passwordError = $("#passwordError");
        let skillError = $("#skillError");

        if (name === "" || email === "" || password === "" || skill === "") {
            nameError.text("Field is required");
            emailError.text("Field is required");
            passwordError.text("Field is required");
            skillError.text("Field is required");
        } else if (name === "") {

        } else {
            // All fields have been filled
            const input = { name, email, password, skill };


            // Check if this email already exist
            axios.get("http://localhost:3000/Freelancers")
                .then(res => {
                    const users = res.data;
                    for (user of users) {
                        if (user.email === input.email) {
                            emailError.text("This email already exist");
                            return;
                        }
                    }


                    // Registration proceeds
                    axios.post("http://localhost:3000/Freelancers", input)
                        .then(response => {
                            // Do something when user successfully registers
                            alert(`You are registered successfully ${response.data.name}. Your can login now`);
                        })
                        .catch(e => console.log(e));
                })
                .catch(e => console.log(e));
        }


    });


    // Signing Freelancer In
    $("#login").on('click', (e) => {
        e.preventDefault();

        let email = $("#email").val();
        let password = $("#password").val();
        let emailError = $("#emailError");
        let passwordError = $("#passwordError");

        if (email == "" || password == "") {
            emailError.text("Required field");
            passwordError.text("Required feild");
        } else if (email == "") {
            emailError.text("Email is required");
        } else if (password == "") {
            passwordError.text("Password field is required");
        } else {
            // Attemp to sign in freelancer
            // Check if user exist in the database db.json
            const input = { email, password };

            axios.get("http://localhost:3000/Freelancers")
                .then((response) => {
                    const users = response.data;

                    for (let user of users) {
                        if (user.email === input.email && user.password === input.password) {
                            // User found... login 
                            console.log("Found");

                            $("#email").val('');
                            $("#password").val('');
                            emailError.text('');
                            passwordError.text("");

                            // Spinner starts turning to login user in

                            // set session and redirect to home
                            $.session.set('userId', user.id);
                            console.log($.session.get('userId'));

                            // redirect freelancer to the homepage
                            window.location.replace("index.html");
                            return;
                        }
                    }

                    // Not found
                    $("#email").val('');
                    $("#password").val('');
                    emailError.text('');
                    passwordError.text("Authentication failed. Please try again");
                })
                .catch(e => console.log(e));
        }

    });

    /*  Profile handling goes here..  **/
    // Only do this in profile.html page
    let path = $(location).attr('pathname');
    if (path === '/profile.html') {
        
        // get the user info from the database and preload the fields
        axios.get(`http://localhost:3000/Freelancers/${userId}`)
            .then(response => {
                const user = response.data;
                $("#profile-info").append(
                    `
                    <ul class="list-group">
                        <li class="list-group-item"><i class="fas fa-user-circle border-right pr-1"></i> <strong>${user.name}</strong></li>
                        <li class="list-group-item"><i class="fas fa-envelope border-right pr-1"></i> ${user.email}</li>
                        <li class="list-group-item"><i class="fas fa-cogs border-right pr-1"></i> ${user.skill}</li>
                    </ul>
                    `
                );
            })
            .catch(e => console.log(e));


        // Delete the account if button has been clicked
        $("#deleteAccount").on('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to delete your account?")) {
                // If Yes, continue to delete account from the database
                axios.delete(`http://localhost:3000/Freelancers/${userId}`)
                    .then(res => {
                        $.session.clear();
                        $.session.remove('userId');
                        window.location.replace("index.html");
                    })
                    .catch(e => console.log(e));
            } else {
                // Abort and refresh page
                window.location.reload();
            }
        })
                
    }
    


    // Loging freelancer out
    $("#logout").on('click', (e) => {
        e.preventDefault();
        // Check if session exist
        if ($.session.get('userId') != 0) {
            $.session.clear();
            $.session.remove('userId');
            window.location.replace("login.html");
        }
    }); 





}); // End of .readyFunction