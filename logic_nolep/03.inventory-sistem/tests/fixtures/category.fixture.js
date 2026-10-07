import { prisma } from "../../lib/prisma.js";
import { randomUUID } from "node:crypto";

const categoryOne = {
    id: randomUUID(),
    name: 'Elektronik',
    isActive: true,
}

const categoryTwo = {
    id: randomUUID(),
    name: 'Perabot',
    isActive: true,
}

const categoryForDelete = {
    id: randomUUID(),
    name: 'Category delete',
    isActive: true,
}

const insertCategories = async(categories) => {
    await prisma.category.createMany({
        data:categories,
        skipDuplicates: true
    })
}

export {
    categoryOne,
    categoryTwo,
    categoryForDelete,
    insertCategories
}