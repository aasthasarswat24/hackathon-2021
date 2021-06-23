import axios from 'axios'
import Noty from 'noty'
import  initAdmin from './admin'
import moment from 'moment'


let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(brownie) {
   axios.post('/update-cart', brownie).then(res => {
       cartCounter.innerText = res.data.totalQty
       new Noty({
           type: 'success',
           timeout: 1000,
           text: 'Item added to cart',
           progressBar: false,
       }).show();
   }).catch(err => {
       new Noty({
           type: 'error',
           timeout: 1000,
           text: 'Something went wrong',
           progressBar: false,
       }).show();
   })
}

addToCart.forEach((btn) => {
   btn.addEventListener('click', (e) => {
       let brownie = JSON.parse(btn.dataset.brownie)
       updateCart(brownie)
   })
})

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
   setTimeout(() => {
       alertMsg.remove()
   }, 2000)
}


//change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small');

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;

    statuses.forEach((status) => {
       let dataProp = status.dataset.status
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
       if(dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
       }
    })

}

updateStatus(order);




//socket
let socket = io()
//join
if(order) {
    socket.emit('join', `order_${order._id}`)
//order_1233(id) gives a unique room for every order
}


let adminAreaPath = window.location.pathname
console.log(adminAreaPath)
if(adminAreaPath.includes('admin'))
initAdmin(socket)
 {
     socket.emit('join', 'adminRoom')
 }

socket.on('orderUpdated', () => {
    const updatedOrder = {...order}
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type:'success',
        timeout:1000,
        text:'order updated',
        progressBar:false
    }).show();
    console.log(data)
})

