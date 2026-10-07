import { prisma } from "../../lib/prisma.js";
import { randomUUID } from "node:crypto";
import { userOne, userTwo } from "./user.fixture.js";
import { productOne, productTwo } from "./product.fixture.js";

const orderOne = {
    id: randomUUID(),
    totalPrice: productOne.price * 3 + productTwo.price * 2,
    customerName: userOne.name,
    customerEmail: userOne.email,
    userId: userOne.id,
}

const orderTwo = {
    id: randomUUID(),
    totalPrice: productOne.price * 2,
    customerName: userTwo.name,
    customerEmail: userTwo.email,
    userId: userTwo.id
}

const orderThree = {
    id: randomUUID(),
    totalPrice: productTwo.price * 2,
    customerName: userTwo.name,
    customerEmail: userTwo.email,
    userId: userTwo.id
}

const orderForDelete = {
    id: randomUUID(),
    totalPrice:0,
    customerName: 'Order Delete',
    customerEmail: 'orderDelete@gmail.com',
    userId: userOne.id
}

const insertOrders = async(orders) => {
    await prisma.order.createMany({
        data: orders,
        skipDuplicates: true
    });
}

export {
    orderOne,
    orderTwo,
    orderThree,
    orderForDelete,
    insertOrders
}