$(window).ready(function () {
    loadAllItemsForComboBox();
    getAllCustomersForComboBox();
    getOrderCount();
    $("#discount").val(0);
})

let customers;
let items;
let cartItems = [];
let orders = [];

function setOrderId(orderCount) {
    $("#orderDate").val(new Date().toISOString().slice(0, 10));
    if (orderCount > 0) {
        $("#orderId").val("O00-00" + (orderCount + 1));
    } else {
        $("#orderId").val("O00-001");
    }
}//this function use to set a next order id

function getOrderCount() {
    $.ajax({
        url: "http://localhost:8080/pos_app/pages/order?option=orderCount",
        method: "get",
        success: function (resp) {
            setOrderId(Number(JSON.parse(resp.data)[0].ordersCount));
        }
    });
}//this function use to get an order count from database

/*function getOrders() {
    $.ajax({
        url: "http://localhost:8080/pos_app/pages/order?option=orders",
        method: "get",
        success: function (resp) {
            orders = resp;
            console.log(orders);
        }
    });
}*/

function loadAllItemsForComboBox() {
    $.ajax({
        url: "http://localhost:8080/pos_app/pages/item",
        method: "get",
        success: function (resp) {
            $("#item-itemCode").empty();
            $("#item-itemCode").append(
                `<option>Select Code</option>`
            );

            items = JSON.parse(resp.data)[0];


            for (let i in items) {
                let item = items[i];
                let code = item.code;
                $("#item-itemCode").append(
                    `<option>${code}</option>`
                );
            }
        },
        error: function (error) {

        }
    });
}//this function use to load items codes for combo box

function getAllCustomersForComboBox() {
    $.ajax({
        url: "http://localhost:8080/pos_app/pages/customer",
        method: "get",
        success: function (resp) {
            $("#invoice-customerNIC").empty();
            $("#invoice-customerNIC").append(
                `<option>Select NIC</option>`
            );

            customers = JSON.parse(resp.data)[0];

            for (let i in customers) {
                let customer = customers[i];
                let nic = customer.nic;
                $("#invoice-customerNIC").append(
                    `<option>${nic}</option>`
                );
            }
        }
    });
}//this function use to load customers nic's for combo box

/*invoice*/
$("#invoice-customerNIC").click(function () {
    let nic = $("#invoice-customerNIC").val();
    if (nic !== "Select NIC") {
        let customer = searchCustomer(nic);
        $("#customerName").val(customer.name);
        $("#customerTel").val(customer.tel);
        $("#customerAddress").val(customer.address);

        $("#invoice-customerNIC").css("border", 'solid green 2px');
        $("#customerName").css("border", 'solid green 2px');
        $("#customerTel").css("border", 'solid green 2px');
        $("#customerAddress").css("border", 'solid green 2px');
    } else {
        $("#customerName").val("");
        $("#customerTel").val("");
        $("#customerAddress").val("");
    }
});

/*item*/
$("#item-itemCode").click(function () {
    let code = $("#item-itemCode").val();
    if (code !== "Select Code") {
        let item = searchItem(code);
        $("#itemName").val(item.name);
        $("#itemPrice").val(item.price);
        $("#itemQTY").val(item.qty);

        $("#item-itemCode").css("border", 'solid green 2px');
        $("#itemName").css("border", 'solid green 2px');
        $("#itemPrice").css("border", 'solid green 2px');
        $("#itemQTY").css("border", 'solid green 2px');
    } else {
        $("#itemName").val("");
        $("#itemPrice").val("");
        $("#itemQTY").val("");
    }
});

$("#Quantity").keyup(function () {
    let qty = $("#Quantity").val();
    if (Number($("#Quantity").val()) !== 0 && $("#Quantity").val() !== "") {
        if (Number(qty) <= Number($("#itemQTY").val())) {
            $("#Quantity").css("border", 'solid green 2px');
        } else {
            $("#Quantity").css("border", 'solid red 2px');
        }
    } else {
        $("#Quantity").css("border", 'solid red 2px');
    }
});//this event use check to input value for quantity


$("#addToCart").click(function () {
    $("#QuantityAlert").text("")
    let nic = $("#invoice-customerNIC").val();
    let code = $("#item-itemCode").val();
    if (nic !== "Select NIC" && code !== "Select Code") {
        let orderId = $("#orderId").val();
        let itemCode = $("#item-itemCode").val();
        let itemName = $("#itemName").val();
        let itemPrice = $("#itemPrice").val();
        let itemQty = $("#Quantity").val();
        if (itemQty <= $("#itemQTY").val() && itemQty !== "") {
            if (!checkOrderAndItem(itemQty)) {
                let newOrder = {
                    "orderId": orderId,
                    "itemCode": itemCode,
                    "itemName": itemName,
                    "itemPrice": itemPrice,
                    "itemQty": itemQty
                }
                cartItems.push(newOrder);
            }
            addToCart();
            updateItemQTY(itemCode, itemQty);
        } else {
            if (itemQty === "") {
                $("#QuantityAlert").text(`Input item quantity`);
                $("#Quantity").css("border", "red solid 2px");
            } else {
                $("#QuantityAlert").text(`${itemQty} of these are not available. The amount in hand is less than ${itemQty} `);
            }
        }
    } else {
        if (nic === "Select NIC" && code === "Select Code") {
            $("#invoice-customerNIC").css("border", 'solid red 2px');
            $("#customerName").css("border", 'solid red 2px');
            $("#customerTel").css("border", 'solid red 2px');
            $("#customerAddress").css("border", 'solid red 2px');

            $("#item-itemCode").css("border", 'solid red 2px');
            $("#itemName").css("border", 'solid red 2px');
            $("#itemPrice").css("border", 'solid red 2px');
            $("#itemQTY").css("border", 'solid red 2px');
        } else if (code === "Select Code") {
            $("#invoice-customerNIC").css("border", 'solid green 2px');
            $("#customerName").css("border", 'solid green 2px');
            $("#customerTel").css("border", 'solid green 2px');
            $("#customerAddress").css("border", 'solid green 2px');

            $("#item-itemCode").css("border", 'solid red 2px');
            $("#itemName").css("border", 'solid red 2px');
            $("#itemPrice").css("border", 'solid red 2px');
            $("#itemQTY").css("border", 'solid red 2px');
        } else {
            $("#invoice-customerNIC").css("border", 'solid red 2px');
            $("#customerName").css("border", 'solid red 2px');
            $("#customerTel").css("border", 'solid red 2px');
            $("#customerAddress").css("border", 'solid red 2px');

            $("#item-itemCode").css("border", 'solid green 2px');
            $("#itemName").css("border", 'solid green 2px');
            $("#itemPrice").css("border", 'solid green 2px');
            $("#itemQTY").css("border", 'solid green 2px');
        }
    }
});

function checkOrderAndItem(itemQty) {
    for (let j = 0; j < cartItems.length; j++) {
        if (cartItems[j].orderId === $("#orderId").val() && cartItems[j].itemCode === $("#item-itemCode").val()) {
            cartItems[j].itemQty = Number(cartItems[j].itemQty) + Number(itemQty);
            return true;
        }
    }
    return false;
}

function addToCart() {
    let tableBody = $("#order-table");
    tableBody.empty();
    for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].orderId === $("#orderId").val()) {
            let tr = `<tr>
                        <td>${cartItems[i].itemCode}</td>
                        <td>${cartItems[i].itemName}</td>
                        <td>${cartItems[i].itemPrice}</td>
                        <td>${cartItems[i].itemQty}</td>
                        <td>
                          <button type="button" class="btn btn-danger border-0" style="background-color: #ff0014"><i class="fa-solid fa-trash-can"></i></button>
                        </td>
                      </tr>`;
            tableBody.append(tr);
        }
    }
    getDeleteCartItem();
    calculateTotal();
}

function calculateTotal() {
    let price = 0, qty = 0, tot = 0;
    const table = $("#order-table")[0];
    for (let i = 0; i < $("#order-table > tr").length; i++) {
        price = Number(table.rows[i].cells[2].textContent);
        qty = Number(table.rows[i].cells[3].textContent);
        tot = tot + (price * qty);
    }
    $("#total").text(tot);
    $("#subTotal").text(tot);
}

function getDeleteCartItem() {
    $("#order-table>tr>td>button:nth-child(1)").click(function () {
        let code = $(this).parents("#order-table>tr").children().eq(0).text();
        let qty = $(this).parents("#order-table>tr").children().eq(3).text();
        let oid = $("#orderId").val();
        let consent = confirm("Do you want to delete.?");
        if (consent) {
            let response = deleteCartItem(oid, code, qty);
            if (response) {
                alert("Item Deleted");
                $("#order-table").empty();
                addToCart();
            } else {
                alert("Item Not Removed..!");
            }
        }
    });
}

function deleteCartItem(oid, code, newQTY) {
    for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].orderId === oid && cartItems[i].itemCode === code) {
            let item = searchItem(code);
            item.qty = Number(item.qty) + Number(newQTY);
            cartItems.splice(i, 1);
            return true;
        }
    }
    return false;
}

function updateItemQTY(itemCode, itemQty) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].code === itemCode) {
            items[i].qty = Number(items[i].qty) - Number(itemQty);
            searchItem(itemCode).qty = items[i].qty;
        }
    }
    searchItem()
    clearItemSection();
}

function clearItemSection() {
    $("#item-itemCode").val("Select Code");
    $("#itemName").val("");
    $("#itemPrice").val("");
    $("#itemQTY").val("");
    $("#Quantity").val("");
}

function clearInvoiceSection() {
    $("#invoice-customerNIC").val("Select NIC");
    $("#customerName").val("");
    $("#customerTel").val("");
    $("#customerAddress").val("");
}

$("#discount,#cash").keydown(function (event) {
    if (event.key === "Enter") {
        $("#cashAlert").text("");
        $("#discountAlert").text("");

        let cash = $("#cash").val();
        let discount = $("#discount").val();
        if (discount >= 0 && discount < 100) {
            $("#discount").css("border", "green solid 2px");
            setBalance(cash, discount);
        } else {
            $("#discount").css("border", "red solid 2px");
            $("#discount").focus();
            $("#discountAlert").text("Negative discounts cannot be added");
        }
        if (cash < $("#total").val() && cash === "") {
            $("#cashAlert").text("This amount is not enough");
        }
    }
});

function setBalance(cash, discount) {
    let tot = ($("#total").text() - ($("#total").text() * (discount / 100)));
    $("#subTotal").text(tot);
    let balance = cash - tot;
    if (balance >= 0) {
        $("#balance").val(balance);
        $("#balance").css("border", "solid 2px green");
    } else {
        $("#balance").css("border", "solid 2px red");
    }
}

$("#place-order").click(function () {
    $("#orderIdAlert").text("");
    $("#cashAlert").text("");
    let total = $("#total").text();
    let subTotal = $("#subTotal").text();
    let cash = $("#cash").val();
    let orderID = $("#orderId").val();

    $.ajax({
        url: "http://localhost:8080/pos_app/pages/order?option=orders",
        method: "get",
        success: function (resp) {
            orders = JSON.parse(resp.data)[0];

            if (undefined === searchOrder(orderID)) {
                console.log("hi")
                if ($("#order-table>tr").length > 0 && $("#invoice-customerNIC").val() !== "Select NIC") {
                    if (Number(cash) >= Number(total) && cash !== "") {
                        let date = $("#orderDate").val();
                        let nic = $("#invoice-customerNIC").val();
                        let discount = $("#discount").val();
                        console.log(discount)
                        let balance = $("#balance").val();
                        let newOrderDetails = {
                            "orderId": orderID,
                            "date": date,
                            "nic": nic,
                            "total": total,
                            "subTotal": subTotal,
                            "cash": cash,
                            "discount": discount,
                            "balance": balance,
                            "cartItems": cartItems
                        }
                        console.log("hi")
                        $.ajax({
                            url: "http://localhost:8080/pos_app/pages/order",
                            method: "post",
                            contentType: "application/json",
                            data: JSON.stringify(newOrderDetails),
                            success: function (resp) {
                                clearItemSection();
                                clearInvoiceSection();

                                $("#order-table").empty();
                                getOrderCount();

                                $("#total").text("0.0");
                                $("#subTotal").text("0.0");
                                $("#cash").val("");
                                $("#discount").val(0);
                                $("#balance").val("");

                                cartItems = [];

                                alert(resp.message);
                            }
                        });
                    } else {
                        $("#cashAlert").text("This amount is not enough");
                    }
                } else {
                    $("#invoice-customerNIC").focus();
                }
            } else {
                $("#orderIdAlert").text(`${orderID} already exits`);
            }
        }
    });
});

function loadToCart() {
    let tableBody = $("#order-table");
    tableBody.empty();
    for (let i = 0; i < cartItems.length; i++) {
        let tr = `<tr>
                     <td>${cartItems[i].itemCode}</td>
                     <td>${cartItems[i].itemName}</td>
                     <td>${cartItems[i].itemPrice}</td>
                     <td>${cartItems[i].itemQty}</td>
                     <td>
                       <button type="button" class="btn btn-danger border-0" style="background-color: #ff0014"><i class="fa-solid fa-trash-can"></i></button>
                     </td>
                   </tr>`;
        tableBody.append(tr);

    }
    getDeleteCartItem();
    // calculateTotal();
}

$("#orderId").keydown(function (event) {
    $("#orderIdAlert").text("");
    if (event.key === "Enter") {
        let orderID = $("#orderId").val();

        console.log("ok");

        $.ajax({
            url: "http://localhost:8080/pos_app/pages/order?option=orderDetails&orderID=" + orderID,
            method: "get",
            success: function (resp) {

                let array=JSON.parse(resp.data)[0];


                if (array.length > 0) {
                    cartItems = array[1];
                    loadToCart();
                    cartItems=[];

                    let customer = array[2];
                    $("#invoice-customerNIC").val(customer.nic);
                    $("#customerName").val(customer.name);
                    $("#customerTel").val(customer.tel);
                    $("#customerAddress").val(customer.address);

                    let orderDetails = array[0];
                    $("#orderDate").text(orderDetails.date);
                    $("#total").text(orderDetails.total);
                    $("#subTotal").text(orderDetails.subTotal);
                    $("#cash").val(orderDetails.cash);
                    $("#discount").val(orderDetails.discount);
                    $("#balance").val(orderDetails.balance);

                } else {
                    $("#orderId").focus();
                    $("#orderIdAlert").text(`${orderID} has no order`);

                    clearItemSection();
                    clearInvoiceSection();
                    $("#order-table").empty();
                    setOrderId();
                    $("#total").text("0.0");
                    $("#subTotal").text("0.0");
                    $("#cash").val("");
                    $("#discount").val(0);
                    $("#balance").val("");
                }
            }
        });
    }
});

function searchOrder(orderID) {
    return orders.find(function (orders) {
        return orders.orderId === orderID;
    });
}
