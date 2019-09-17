// Email Validation
function validateEmail(email) {
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
}  

// Validate Password
function validatePassword(password) {
    let re = /^(?=.{6,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/;
    return re.test(password);
}

// Password Confirmation
function confirmPassword(password, confirm) {
    return password.trim() === confirm.trim();
}


$(document).ready(function () {

    // Handling Sessions
    $("#logout").hide();
    $("#profile").hide();
    const userId = $.session.get('userId') != 0 ? $.session.get('userId') : 0;
    let path = $(location).attr('pathname');
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
        // registerGeneralErrorTimeOut
        setTimeout(() => {
            $("#registerGeneralError").addClass("d-none");
        }, 5000);

        let name = $("#name").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let confirm = $("#confirm").val();
        let skill = $("#skill").val();

        // Error feilds
        let nameError = $("#nameError");
        let emailError = $("#emailError");
        let passwordError = $("#passwordError");
        let confirmError = $("#confirmError");
        let skillError = $("#skillError");
        let registerGeneralError = $("#registerGeneralError");

        // Validations
        if (name === "" || email === "" || password === "" || confirm === "" || skill === "") {
            registerGeneralError.removeClass('d-none');
        } else if (name === "" || name.length < 6) {
            $("#name").css('border', '1px solid red');
            nameError.text("Please, enter a valid name");
        } else if (!validateEmail(email)) {
            $("#email").css('border', '1px solid red');
            emailError.text("Please, enter a valid email address");
        } else if (password.length < 6 || password === "") {
            $("#password").css('border', '1px solid red');
            passwordError.text("Password minimum length is 6");
        } else if (!validatePassword(password)) {
            $("#password").css('border', '1px solid red');
            passwordError.text("Password is weak. (E.g) Abc@123");
        } else if (!confirmPassword(password, confirm)) {
            $("#password").css('border', '1px solid red');
            $("#confirm").css('border', '1px solid red');
            confirmError.text("Password doesn't match");
        } else if (skill.length <= 3 || skill === "") {
            $("#skill").css('border', '1px solid red');
            skillError.text("Skill minimum length is 4");
        } else {
            // All fields have been filled
            name = name.trim();
            email = email.trim();
            password = password.trim();
            skill = skill.trim();

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
                            $("#email").val('');
                            $("#password").val('');
                            emailError.text('');
                            passwordError.text("");

                            // Spinner starts turning to login user in

                            // set session and redirect to home
                            $.session.set('userId', user.id);

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




    // Only do this in view.html
    if (path === '/view.html') {
        const full_path = window.location.href;
        const full_path_arr = full_path.split('id=');
        
        const id = full_path_arr[1];

        // Get user info according to the id
        axios.get(`http://localhost:3000/Freelancers/${id}`)
            .then(response => {
                const user = response.data;
                $("#name").text(`${user.name}`);
                $("#freelance-profile-info").append(
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
    }
    

    // Only do this in editProfile.html
    if (path === '/editProfile.html') {
        // Get the user record from the database and auto fill the fields
        axios.get(`http://localhost:3000/Freelancers/${userId}`)
            .then(response => {
                const user = response.data;
                $("#name").val(user.name);
                $("#email").val(user.email);
                $("#password").val(user.password);
                $("#skill").val(user.skill);
            })
            .catch(e => console.log(e));

        $("#updateBtn").on('click', (e) => {
            e.preventDefault();

            let name = $("#name").val();
            let email = $("#email").val();
            let password = $("#password").val();
            let skill = $("#skill").val();

            // Error feilds
            let nameError = $("#nameError");
            let passwordError = $("#passwordError");
            let skillError = $("#skillError");
            let registerGeneralError = $("#registerGeneralError");

            if (name === "" || password === "" || skill === "") {
                registerGeneralError.removeClass('d-none');
            } else if (name === "" || name.length < 6) {
                $("#name").css('border', '1px solid red');
                nameError.text("Please, enter a valid name");
            } else if (password.length < 6 || password === "") {
                $("#password").css('border', '1px solid red');
                passwordError.text("Password minimum length is 6");
            } else if (!validatePassword(password)) {
                $("#password").css('border', '1px solid red');
                passwordError.text("Password is weak. (E.g) Abc@123");
            } else if (skill.length <= 3 || skill === "") {
                $("#skill").css('border', '1px solid red');
                skillError.text("Skill minimum length is 4");
            } else {
                // Remove white trailing spaces from all input values
                name = name.trim();
                email = email.trim();
                password = password.trim();
                skill = skill.trim();

                const input = { name, email, password, skill };

                axios.put(`http://localhost:3000/Freelancers/${userId}`, input)
                    .then(res => {
                        alert("Your profile has been updated successfully");
                    })
                    .catch(e => console.log(e));
            }
        });
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