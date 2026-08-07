async function loadProfile() {


    const msg =
        document
        .getElementById(
            "message"
        );


    try {


        const response =
            await fetch(
                "/api/profile"
            );


        const data =
            await response.json();



        if (
            response.status ===
            401
        ) {

            window.location.href =
                "login.html";

            return;

        }



        if (!data.profile) {

            window.location.href =
                "userdata.html";

            return;

        }



        document
        .getElementById("name")
        .value =
            data.profile.name;



        document
        .getElementById("email")
        .value =
            data.profile.email;



        document
        .getElementById("phone")
        .value =
            data.profile.phone;



        document
        .getElementById("gender")
        .value =
            data.profile.gender;



        document
        .getElementById("dob")
        .value =
            data.profile.dob;



        if (data.resume) {

            document
            .getElementById(
                "fileName"
            )
            .innerHTML =

                "Uploaded PDF: " +
                data.resume.originalName;

        }


    }

    catch (error) {


        msg.className =
            "error";


        msg.innerHTML =
            "Unable to load profile.";


    }

}



document
.getElementById("uploadForm")
.addEventListener(
    "submit",
    async function(event) {


        event.preventDefault();


        const file =
            document
            .getElementById(
                "fileUpload"
            )
            .files[0];


        const msg =
            document
            .getElementById(
                "message"
            );



        if (!file) {

            msg.className =
                "error";

            msg.innerHTML =
                "Select a PDF.";

            return;

        }



        if (
            file.size >
            5 * 1024 * 1024
        ) {

            msg.className =
                "error";

            msg.innerHTML =
                "PDF cannot exceed 5 MB.";

            return;

        }



        if (
            file.type !==
            "application/pdf"
        ) {

            msg.className =
                "error";

            msg.innerHTML =
                "Only PDF files are allowed.";

            return;

        }



        const formData =
            new FormData();


        formData.append(
            "resume",
            file
        );



        try {


            const response =
                await fetch(
                    "/api/profile/upload",
                    {

                        method:
                            "POST",

                        body:
                            formData

                    }
                );


            const data =
                await response.json();



            if (!response.ok) {

                msg.className =
                    "error";

                msg.innerHTML =
                    data.message;

                return;

            }



            msg.className =
                "success";


            msg.innerHTML =
                data.message;



            document
            .getElementById(
                "fileName"
            )
            .innerHTML =

                "Uploaded PDF: " +
                data.fileName;


        }

        catch (error) {


            msg.className =
                "error";


            msg.innerHTML =
                "Upload failed.";


        }


    }
);



loadProfile();