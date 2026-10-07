import { prisma } from "../../lib/prisma.js";
import{ randomUUID } from "node:crypto";
import { categoryOne, categoryTwo } from "./category.fixture.js";
import { userOne, userTwo } from "./user.fixture.js";

const productOne = {
    id: randomUUID(),
    name: 'kulkas',
    description: 'kulkas 2 pintu',
    price: 2500000,
    quantityInStock: 15,
    categoryId: categoryOne.id,
    userId: userOne.id,
    isActive: true
}

const productTwo = {
    id: randomUUID(),
    name: 'meja',
    description: 'meja petak',
    price: 500000,
    quantityInStock: 10,
    categoryId: categoryTwo.id,
    userId: userTwo.id,
    isActive: true
}

const productForDelete = {
    id: randomUUID(),
    name: 'product delete',
    description: 'test product delete',
    price: 500000,
    quantityInStock: 10,
    categoryId: categoryOne.id,
    userId: userOne.id,
    isActive: true
}

const insertProducts = async(products) => {
    await prisma.product.createMany({
        data: products,
        skipDuplicates: true
    });
}

export {
    productOne,
    productTwo,
    productForDelete,
    insertProducts
}