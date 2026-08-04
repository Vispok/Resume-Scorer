//for Reading user ka data localStorage se but pehle local storage mei register wale ka data jayega js ki madad se

const user = JSON.parse(localStorage.getItem("user"));

if(user){

    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;
    document.getElementById("phone").value = user.phone;
    document.getElementById("gender").value = user.gender;
    document.getElementById("dob").value = user.dob;
    document.getElementById("address").value = user.address;

}

// File Upload krne ke liye hai ye

document.getElementById("fileUpload").addEventListener("change", function(){

    const file = this.files[0];

    if(!file) return;

    const maxSize = 5 * 1024 * 1024;

    if(file.size > maxSize){

        alert("File size should not exceed 3 MB.");
        this.value = "";
        return;

    }

    console.log("Uploaded File:");

    console.log(file);

});