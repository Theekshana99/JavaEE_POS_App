$(document).ready(function () {
    getAllCustomers();
});

$("#save-customer").click(function () {
    let dataForm = $("#customer-form").serialize();
    $.ajax({
        url: "http://localhost:8080/pos_app/pages/customer",
        method: "post",
        data: dataForm,
        success: function (rep) {
            getAllCustomers();
            alert(rep.message);
        },
        error: function (error) {
            alert(rep.responseJSON.message);

        }
    })
});

function deleteCustomer() {
    $("#customer-table-body>tr>td>button:nth-child(1)").click(function () {
        let nic = $(this).parents("#customer-table-body>tr").children().eq(0).text();
        let consent = confirm("Do you want to delete.?");
        if (consent) {
            $.ajax({
                url: "http://localhost:8080/pos_app/pages/customer?nic=" + nic,
                method: "delete",
                success: function (rep) {
                    getAllCustomers();
                    alert(rep.message);
                },
                error: function (error) {
                    alert(error.responseJSON.message);
                }
            })
        }
    });
}

$("#customerUpdateButton").click(function () {
    let nic = $('#inputUpdateNIC').val();
    let name = $('#inputUpdateName').val();
    let tel = $('#inputUpdateTel').val();
    let address = $('#inputUpdateAddress').val();
    let customer = {
        "nic": nic,
        "name": name,
        "tel": tel,
        "address": address
    }
    let consent = confirm("Do you want to Update.?");
    if (consent) {
        $.ajax({
            url: "http://localhost:8080/pos_app/pages/customer",
            method: "put",
            contentType: "application/json",
            data: JSON.stringify(customer),
            success: function (rep) {
                getAllCustomers();
                alert(rep.message);
            },
            error: function (error) {
                alert(error.responseJSON.message);
            }
        })
    }
});

function setDetailsForUpdateForm() {
    $("#customer-table-body>tr>td>button:nth-child(2)").click(function () {
        let nic = $(this).parents("#customer-table-body>tr").children().eq(0).text();
        let name = $(this).parents("#customer-table-body>tr").children().eq(1).text();
        let tel = $(this).parents("#customer-table-body>tr").children().eq(2).text();
        let address = $(this).parents("#customer-table-body>tr").children().eq(3).text();

        $('#inputUpdateNIC').val(nic);
        $('#inputUpdateName').val(name);
        $('#inputUpdateTel').val(tel);
        $('#inputUpdateAddress').val(address);

        popUpUpdateCustomerForm();

    });
}

function popUpUpdateCustomerForm() {
    let modalToggle = $('#customer-table-body>tr');
    let myModal = new bootstrap.Modal($('#updateCustomer'));
    myModal.show(modalToggle);
}

function getAllCustomers() {
    $.ajax({
        url: "http://localhost:8080/pos_app/pages/customer",
        method: "get",
        success: function (rep) {

            let array=JSON.parse(rep.data)[0];

            $("#customer-table-body").empty();
            for (let i in array) {
                let customer = array[i];
                let nic = customer.nic;
                let name = customer.name;
                let tel = customer.tel;
                let address = customer.address;
                let row = `<tr>
                        <td>${nic}</td>
                        <td>${name}</td>
                        <td>${tel}</td>
                        <td>${address}</td>
                        <td>
                          <button type="button" class="btn btn-danger border-0" style="background-color: #ff0014"><i class="fa-solid fa-trash-can"></i></button>
                          <button type="button" class="btn border-0 btn-danger" style="background-color: #1aff00;"><i class="fa-solid fa-pencil"></i></button>
                        </td>
                    </tr>`
                $("#customer-table-body").append(row);
            }

            deleteCustomer();
            setDetailsForUpdateForm();

        }
    });
}

function searchCustomer(nic) {
    return customers.find(function (customer) {
        return customer.nic === nic;
    });//return to matched customer object
}//this function use to search customer and return matched customer object
