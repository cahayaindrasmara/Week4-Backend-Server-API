import { prisma } from "../../lib/prisma";
import { randomUUID } from "node:crypto";
import { orderOne, orderTwo } from "./order.fixture";
import { productOne, productTwo } from "./product.fixture";

const orderItemOne = { 
    id: randomUUID(),
    orderId: orderOne.id,
    productId: productOne.id,
    quantity: 3,
    unitPrice: productOne.price
}

const orderItemTwo = { 
    id: randomUUID(),
    orderId: orderOne.id,
    productId: productTwo.id,
    quantity: 2,
    unitPrice: productTwo.price
}

const orderItemThree = { 
    id: randomUUID(),
    orderId: orderTwo.id,
    productId: productOne.id,
    quantity: 2,
    unitPrice: productOne.price
}

const orderItemFour = { 
    id: randomUUID(),
    orderId: orderTwo.id,
    productId: productTwo.id,
    quantity: 2,
    unitPrice: productTwo.price
}

const insertOrderItems = async (orderItems) => {
    await prisma.orderItem.createMany({
        data: orderItems,
        skipDuplicates: true
    })
}

export {
    orderItemOne,
    orderItemTwo,
    orderItemThree,
    orderItemFour,
    insertOrderItems
}