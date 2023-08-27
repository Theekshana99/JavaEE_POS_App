$(window).ready(function () {
    getAllItems();
});

function getAllItems() {
    $.ajax({
        url: "http://localhost:8080/pos_app/pages/item",
        method: "get",
        success: function (resp) {

            let array=JSON.parse(resp.data)[0];

            $("#item-table-body").empty();
            for (let i in array) {
                let item = array[i];
                let code = item.code;
                let name = item.name;
                let price = item.price;
                let qty = item.qty;
                let row = `
                        <tr>
                            <td>${code}</td>
                            <td>${name}</td>
                            <td>${price}</td>
                            <td>${qty}</td>
                            <td>
                                <button type="button" class="btn btn-danger border-0" style="background-color: #ff0014"><i class="fa-solid fa-trash-can"></i></button>
                                 <button type="button" class="btn border-0 btn-danger" style="background-color: #1aff00;"><i class="fa-solid fa-pencil"></i></button>
                            </td>
                        </tr>`
                $("#item-table-body").append(row);
            }

            setDetailsForItemsUpdateForm();
            deleteItem();

        },
        error: function (error) {

        }
    });
}

$("#save-item").click(function () {
    let formData = $("#item-form").serialize();
    console.log(formData);
    $.ajax({
        url: "http://localhost:8080/pos_app/pages/item",
        method: "post",
        data: formData,
        success: function (resp) {
            getAllItems();
            alert(resp.message);
        },
        error: function (error) {

        }
    });
});

$("#itemUpdateButton").click(function () {
    let code = $('#inputUpdateItemCode').val();
    let name = $('#inputUpdateItemName').val();
    let price = $('#inputUpdateItemPrice').val();
    let qty = $('#inputUpdateItemQuantity').val();
    let item = {
        "code": code,
        "name": name,
        "price": price,
        "qty": qty
    }
    if (confirm("Do you want to Update.?")) {
        $.ajax({
            url: "http://localhost:8080/pos_app/pages/item",
            method: "put",
            contentType: "application/json",
            data: JSON.stringify(item),
            success: function (resp) {
                getAllItems();
                alert(resp.message);
            },
            error: function (error) {

            }
        });
    }
});

function setDetailsForItemsUpdateForm() {
    $("#item-table-body>tr>td>button:nth-child(2)").click(function () {
        let code = $(this).parents("#item-table-body>tr").children().eq(0).text();
        let name = $(this).parents("#item-table-body>tr").children().eq(1).text();
        let price = $(this).parents("#item-table-body>tr").children().eq(2).text();
        let qty = $(this).parents("#item-table-body>tr").children().eq(3).text();

        $('#inputUpdateItemCode').val(code);
        $('#inputUpdateItemName').val(name);
        $('#inputUpdateItemPrice').val(price);
        $('#inputUpdateItemQuantity').val(qty);

        popUpUpdateItemForm();
    });
}

function popUpUpdateItemForm() {
    let modalToggle = $('#item-table-body>tr');
    let myModal = new bootstrap.Modal($('#updateItem'));
    myModal.show(modalToggle);
}

function deleteItem() {
    $("#item-table-body>tr>td>button:nth-child(1)").click(function () {
        if (confirm("Do you want to delete.!")) {
            let code = $(this).parents("#item-table-body>tr").children().eq(0).text();
            $.ajax({
                url: "http://localhost:8080/pos_app/pages/item?code=" + code,
                method: "delete",
                success: function (resp) {
                    getAllItems();
                    alert(resp.message);
                },
                error: function (error) {

                }
            });
        }
    });
}

function searchItem(code) {
    return items.find(function (item) {
        return item.code === code;
    });
}//this function use to search item and return matched item object
